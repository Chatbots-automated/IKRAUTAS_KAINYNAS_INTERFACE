import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseServer;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total offers this month
    const { count: offersThisMonth } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Total offers last month (for comparison)
    const { count: offersLastMonth } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString());

    // Get all offers with items for revenue calculation
    const { data: allOffers, error: offersError } = await supabase
      .from('offers')
      .select(`
        *,
        offer_items (
          id,
          name,
          unit_price,
          quantity,
          vat_rate
        )
      `)
      .order('created_at', { ascending: false });

    if (offersError) throw offersError;

    // Calculate revenue from accepted offers
    const acceptedOffers = allOffers?.filter((offer: any) => offer.status === 'accepted') || [];
    
    let totalRevenue = 0;
    acceptedOffers.forEach((offer: any) => {
      let offerTotal = 0;
      
      offer.offer_items?.forEach((item: any) => {
        const lineTotal = item.unit_price * item.quantity;
        const lineTotalWithVat = lineTotal * (1 + (item.vat_rate || 0.21));
        offerTotal += lineTotalWithVat;
      });
      
      // Apply discounts
      if (offer.apply_discount_after_vat && offer.discount_percent) {
        offerTotal = offerTotal * (1 - offer.discount_percent / 100);
      }
      if (offer.ignitis_discount_eur) {
        offerTotal -= offer.ignitis_discount_eur;
      }
      
      totalRevenue += offerTotal;
    });

    // Conversion rate (sent → accepted)
    const sentOffers = allOffers?.filter((offer: any) => 
      offer.status === 'sent' || offer.status === 'accepted'
    ) || [];
    const conversionRate = sentOffers.length > 0 
      ? (acceptedOffers.length / sentOffers.length) * 100 
      : 0;

    // Top products
    const productCounts = new Map<string, { name: string; count: number; revenue: number }>();
    
    allOffers?.forEach((offer: any) => {
      offer.offer_items?.forEach((item: any) => {
        const existing = productCounts.get(item.id) || { name: 'Unknown', count: 0, revenue: 0 };
        const lineTotal = item.unit_price * item.quantity * (1 + (item.vat_rate || 0.21));
        
        productCounts.set(item.id, {
          name: item.name || 'Unknown Product',
          count: existing.count + item.quantity,
          revenue: existing.revenue + lineTotal,
        });
      });
    });

    const topProducts = Array.from(productCounts.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent activity (last 10 offers)
    const recentActivity = allOffers?.slice(0, 10).map((offer: any) => ({
      id: offer.id,
      offer_no: offer.offer_no,
      client_name: offer.client_name,
      status: offer.status,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
    })) || [];

    // Status breakdown
    const statusCounts = {
      draft: allOffers?.filter((o: any) => o.status === 'draft').length || 0,
      sent: allOffers?.filter((o: any) => o.status === 'sent').length || 0,
      accepted: allOffers?.filter((o: any) => o.status === 'accepted').length || 0,
      rejected: allOffers?.filter((o: any) => o.status === 'rejected').length || 0,
    };

    return NextResponse.json({
      ok: true,
      data: {
        offersThisMonth: offersThisMonth || 0,
        offersLastMonth: offersLastMonth || 0,
        totalRevenue,
        conversionRate,
        topProducts,
        recentActivity,
        statusCounts,
        totalOffers: allOffers?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
