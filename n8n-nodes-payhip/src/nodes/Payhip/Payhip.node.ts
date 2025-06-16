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
		credentials: [
			{
				name: 'payhipApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload Product',
						value: 'uploadProduct',
						description: 'Upload a new product to Payhip',
						action: 'Upload a new product to Payhip',
					},
				],
				default: 'uploadProduct',
			},
			{
				displayName: 'Product Name',
				name: 'productName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['uploadProduct'],
					},
				},
			},
			{
				displayName: 'Product Price',
				name: 'productPrice',
				type: 'number',
				required: true,
				default: 0,
				displayOptions: {
					show: {
						operation: ['uploadProduct'],
					},
				},
			},
			{
				displayName: 'Product File Path',
				name: 'productFilePath',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: {
						operation: ['uploadProduct'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		const credentials = await this.getCredentials('payhipApi');
		const operation = this.getNodeParameter('operation', 0) as string;

		const browser = await chromium.launch({ headless: true });
		const context = await browser.newContext();
		const page = await context.newPage();

		try {
			// Login
			await page.goto('https://payhip.com/login');
			await page.fill('input[type="email"]', credentials.email as string);
			await page.fill('input[type="password"]', credentials.password as string);
			await page.click('button[type="submit"]');
			await page.waitForNavigation();

			for (let i = 0; i < items.length; i++) {
				if (operation === 'uploadProduct') {
					const productName = this.getNodeParameter('productName', i) as string;
					const productPrice = this.getNodeParameter('productPrice', i) as number;
					const productFilePath = this.getNodeParameter('productFilePath', i) as string;

					// Navigate to new product page
					await page.goto('https://payhip.com/add/product');
					
					// Fill in product details
					await page.fill('input[name="product[title]"]', productName);
					await page.fill('input[name="product[price]"]', productPrice.toString());
					
					// Upload file
					const fileInput = await page.locator('input[type="file"]');
					await fileInput.setInputFiles(productFilePath);
					
					// Wait for upload to complete and submit
					await page.waitForSelector('button[type="submit"]:not([disabled])');
					await page.click('button[type="submit"]');
					
					// Wait for success indicator
					await page.waitForURL('**/dashboard/products*');

					returnData.push({
						success: true,
						productName,
						message: 'Product uploaded successfully',
					});
				}
			}
		} catch (error) {
			console.error('Error:', error);
			throw error;
		} finally {
			await browser.close();
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
