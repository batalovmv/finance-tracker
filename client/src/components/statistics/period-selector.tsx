import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/i18n';

type PeriodSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { t } = useTranslation();

  const PERIODS = [
    { label: t('period.thisMonth'), value: '1' },
    { label: t('period.3months'), value: '3' },
    { label: t('period.6months'), value: '6' },
    { label: t('period.12months'), value: '12' },
  ];

  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        {PERIODS.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* Hidden panels satisfy aria-controls on each TabsTrigger */}
      {PERIODS.map((p) => (
        <TabsContent key={p.value} value={p.value} className="sr-only" />
      ))}
    </Tabs>
  );
}
