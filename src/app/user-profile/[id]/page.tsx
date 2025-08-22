import Portfolio from '@/components/Portfolio';

export default async function PortfolioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <Portfolio username={id} viewOnly={true} />;
}
