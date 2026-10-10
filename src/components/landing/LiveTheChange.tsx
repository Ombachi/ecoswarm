import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MerchCollection } from './MerchCollection';
export function LiveTheChange() {
  return <section id="live-the-change" className="py-14 md:py-20 bg-muted/30"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><h2 className="text-3xl md:text-4xl font-black">Real people, <span className="text-primary">real change</span></h2><p className="text-muted-foreground mt-3">EcoMerch for the way you live, learn and care for the planet.</p></div><Button asChild variant="outline"><Link to="/merch">Browse EcoMerch</Link></Button></div><MerchCollection limit={3} /></div></section>;
}
