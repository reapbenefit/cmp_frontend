import Portfolio from '@/components/Portfolio';

export default function PortfolioPage({ params }: { params: { id: string } }) {
    return <Portfolio username={params.id} viewOnly={true} />;
}
