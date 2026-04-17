import Link from 'next/link';
import { Settings2, Plus, List, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductsMenuToggle } from '@/components/products-menu-toggle';
import { ParamsProvider } from '@/components/params-provider';

export default function ProductsLayout({ params, children }) {
	const { u, companySlug, branch } = params;

	const navigationItems = [
		{ label: 'Products', href: '/', icon: List },
		{ label: 'Create Product', href: 'create', icon: Plus },
		{ label: 'Categories', href: 'categories', icon: Palette },
		{ label: 'Settings', href: 'settings', icon: Settings2 },
	];

	return (
		<ParamsProvider params={params}>
			<div className="w-full flex-col font-WixMade flex px-1 h-full overflow-hidden">
				{/* Sidebar Navigation */}
				<header
					className={` bg-white border-gray-200 transition-all py-1 items-center duration-300 flex `}
				>
					<div className="text-base ml-2 mr-5">
						<h2 className=" font-bold  text-gray-800">Products</h2>
					</div>
					<nav id="products-nav" data-menu-view="expanded" className="flex gap-1.5 overflow-y-auto">
						{navigationItems.map((item) => (
							<Link
								key={item.label}
								href={`/users/${u}/company/${companySlug}/branches/${branch}/modules/products/${item.href}`}
							>
                                <Button variant={'ghost'} className={'h-7'}>
                                    <span className="text-xl"><item.icon className='text-army font-extrabold'/></span>
                                    <span className="menu-label text-sm font-medium">{item.label}</span>
                                </Button>
							</Link>
						))}
					</nav>
					<div className="">
						<ProductsMenuToggle />
					</div>
				</header>

				{/* Main Content */}
				<main className="flex-1 overflow-auto">
					<div className="p-2 ">
						{children}
					</div>
				</main>

				<style>{`
					nav[data-menu-view="collapsed"] .menu-label {
						display: none;
					}
					
					nav[data-menu-view="expanded"] .menu-label {
						display: inline;
					}
				`}</style>
			</div>
		</ParamsProvider>
	);
}
