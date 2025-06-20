import { 
	IExecuteFunctions, 
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeConnectionType,
} from 'n8n-workflow';
import { chromium } from '@playwright/test';

export class Payhip implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Payhip',
		name: 'payhip',
		icon: 'file:payhip.png',
		group: ['transform'],
		version: 1,
		description: 'Upload products to Payhip using browser automation',
		defaults: {
			name: 'Payhip',
		},
		inputs: [
			{
				displayName: 'Input',
				maxConnections: 1,
				required: true,
				type: NodeConnectionType.Main,
			}
		],
		outputs: [
			{
				displayName: 'Output',
				maxConnections: 1,
				type: NodeConnectionType.Main,
			}
		],
		properties: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
			},
			{
				displayName: 'Product Title',
				name: 'productTitle',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Product Price',
				name: 'productPrice',
				type: 'number',
				default: 0,
				required: true,
			},
			{
				displayName: 'Product Description',
				name: 'productDescription',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'File Path',
				name: 'filePath',
				type: 'string',
				default: '',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const email = this.getNodeParameter('email', i) as string;
			const password = this.getNodeParameter('password', i) as string;
			const productTitle = this.getNodeParameter('productTitle', i) as string;
			const productPrice = this.getNodeParameter('productPrice', i) as number;
			const productDescription = this.getNodeParameter('productDescription', i) as string;
			const filePath = this.getNodeParameter('filePath', i) as string;

			const browser = await chromium.launch({ headless: false });
			const context = await browser.newContext();
			const page = await context.newPage();

			try {
				// Navigate to Payhip login page
				await page.goto('https://payhip.com/login');
				await page.fill('input[type="email"]', email);
				await page.fill('input[type="password"]', password);
				await page.click('button[type="submit"]');

				// Wait for navigation after login
				await page.waitForNavigation();

				// Navigate to new product page
				await page.goto('https://payhip.com/products/new');

				// Fill in product details
				await page.fill('input[name="title"]', productTitle);
				await page.fill('input[name="price"]', productPrice.toString());
				await page.fill('textarea[name="description"]', productDescription);

				// Upload file
				const fileInput = await page.$('input[type="file"]');
				if (fileInput) {
					await fileInput.setInputFiles(filePath);
				}

				// Submit form
				await page.click('button[type="submit"]');

				// Wait for successful upload
				await page.waitForSelector('.success-message');

				returnData.push({
					json: {
						success: true,
						message: 'Product uploaded successfully',
						productTitle,
						productPrice,
					},
				});
			} catch (error) {
				returnData.push({
					json: {
						success: false,
						error: error.message,
					},
				});
			} finally {
				await browser.close();
			}
		}

		return [returnData];
	}
}