import { supabase } from '@/lib/supabase';
import ProfileClient from './ProfileClient';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const { data } = await supabase
        .from('practices')
        .select('name, city')
        .eq('google_place_id', id)
        .single();

    if (!data) return { title: 'Praktijk niet gevonden' };

    return {
        title: `${data.name} — Fysiotherapie ${data.city || ''} | FysioVind`,
        description: `Bekijk het profiel van ${data.name} in ${data.city}. Contactgegevens, beoordelingen en meer.`,
    };
}

export default async function PracticePage({ params }) {
    const { id } = await params;

    const { data: practice } = await supabase
        .from('practices')
        .select('*')
        .eq('google_place_id', id)
        .single();

    if (!practice) {
        return (
            <div style={{ textAlign: 'center', padding: 120 }}>
                <h1>Praktijk niet gevonden</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
                    Deze praktijk bestaat niet of is verwijderd.
                </p>
            </div>
        );
    }

    // Get similar practices in same city
    const { data: similar } = await supabase
        .from('practices')
        .select('*')
        .eq('city', practice.city)
        .neq('google_place_id', id)
        .order('rating', { ascending: false })
        .limit(3);

    return <ProfileClient practice={practice} similar={similar || []} />;
}
