import type { Metadata } from 'next';
import ProductCatalogue from '@/components/ProductCatalogue';
export const metadata: Metadata={title:'Products',description:'Explore technology products and practical recommendations from Highbrow Shop.'};
export default function ProductsPage(){return <ProductCatalogue/>;}
