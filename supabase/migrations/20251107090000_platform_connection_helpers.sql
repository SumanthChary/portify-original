-- Helper functions for platform connection storage and retrieval
SET search_path TO public;

CREATE OR REPLACE FUNCTION public.store_platform_connection(
    p_user_id uuid,
    p_platform text,
    p_connection_type text,
    p_display_name text,
    p_payload jsonb,
    p_secret text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_encrypted_payload text;
    v_connection_id uuid;
BEGIN
    IF p_secret IS NULL OR length(trim(p_secret)) = 0 THEN
        RAISE EXCEPTION 'Encryption key is required';
    END IF;

    v_encrypted_payload := encode(
        pgp_sym_encrypt(
            convert_to(coalesce(p_payload::text, '{}'), 'utf8'),
            p_secret,
            'cipher-algo=aes256'
        ),
        'base64'
    );

    INSERT INTO public.platform_connections AS pc (
        user_id,
        platform,
        connection_type,
        display_name,
        encrypted_payload,
        last_verified_at
    ) VALUES (
        p_user_id,
        lower(p_platform),
        p_connection_type,
        p_display_name,
        v_encrypted_payload,
        now()
    )
    ON CONFLICT (user_id, platform) DO UPDATE
        SET connection_type = EXCLUDED.connection_type,
            display_name = EXCLUDED.display_name,
            encrypted_payload = EXCLUDED.encrypted_payload,
            last_verified_at = now(),
            updated_at = now()
    RETURNING pc.id INTO v_connection_id;

    RETURN v_connection_id;
END;
$$;

COMMENT ON FUNCTION public.store_platform_connection IS 'Encrypts and stores a reusable platform connection for a user.';

CREATE OR REPLACE FUNCTION public.get_platform_connection(
    p_user_id uuid,
    p_platform text,
    p_secret text
) RETURNS TABLE (
    id uuid,
    platform text,
    connection_type text,
    display_name text,
    payload jsonb,
    last_verified_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record public.platform_connections%ROWTYPE;
BEGIN
    IF p_secret IS NULL OR length(trim(p_secret)) = 0 THEN
        RAISE EXCEPTION 'Encryption key is required';
    END IF;

    SELECT * INTO v_record
    FROM public.platform_connections
    WHERE user_id = p_user_id
      AND platform = lower(p_platform);

    IF NOT FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        v_record.id,
        v_record.platform,
        v_record.connection_type,
        v_record.display_name,
        to_jsonb(
            convert_from(
                pgp_sym_decrypt(
                    decode(v_record.encrypted_payload, 'base64'),
                    p_secret,
                    'cipher-algo=aes256'
                ),
                'utf8'
            )::json
        ) AS payload,
        v_record.last_verified_at,
        v_record.created_at,
        v_record.updated_at;
END;
$$;

COMMENT ON FUNCTION public.get_platform_connection IS 'Decrypts and returns a stored platform connection for a user.';
