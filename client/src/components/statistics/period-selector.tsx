import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PeriodSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const PERIODS = [
  { label: 'This Month', value: '1' },
  { label: '3 Months', value: '3' },
  { label: '6 Months', value: '6' },
  { label: '12 Months', value: '12' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <Tabs value={value} onValueChange={onChange}>
      <TabsList>
        {PERIODS.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
