import { PageHeader } from "@/components/ui/page-header";
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation('common');
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <PageHeader
        title={t('terms.title')}
        subtitle={t('terms.subtitle')}
      />
      
      <div className="prose prose-lg max-w-none mt-8">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('terms.section1.title')}</h2>
          <p className="mb-4">
            {t('terms.section1.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('terms.section2.title')}</h2>
          <p className="mb-4">
            {t('terms.section2.content')}
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t('terms.section2.item1')}</li>
            <li>{t('terms.section2.item2')}</li>
            <li>{t('terms.section2.item3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('terms.section3.title')}</h2>
          <p className="mb-4">
            {t('terms.section3.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('terms.section4.title')}</h2>
          <p className="mb-4">
            {t('terms.section4.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('terms.section5.title')}</h2>
          <p className="mb-4">
            {t('terms.section5.content')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('terms.section6.title')}</h2>
          <p className="mb-4">
            {t('terms.section6.content')}
          </p>
        </section>
      </div>
    </div>
  );
}
