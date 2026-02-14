import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { userApi } from '../src/api/user.api';
import { incomeApi, OtherDeductionItem } from '../src/api/income.api';
import Logo from '../src/components/Logo';
import StaggerChildren from '../src/components/StaggerChildren';
import InfoTooltip from '../src/components/InfoTooltip';
import { formatCurrency, parseCurrency } from '../src/utils/currencyFormatter';
import {
  calculateFederalTax,
  calculateStateTax,
  calculateSocialSecurityTax,
  calculateMedicareTax,
  calculateGrossAnnual,
  calculateNetAnnual,
  annualizePerPaycheck,
  retirementAnnualFromPercent,
  formatMoney,
  US_STATES,
  PAY_FREQUENCY_MULTIPLIERS,
} from '../src/utils/taxCalculator';

const TOTAL_STEPS = 8;

const STEP_INFO: Record<number, string> = {
  1: 'We use your currency to format all monetary values throughout the app. This is purely for display — no currency conversion happens.',
  2: 'Your employment type helps us tailor the onboarding questions. For example, interns may have different deduction options than full-time employees.',
  3: 'Knowing whether you earn a fixed salary or hourly wages lets us calculate your gross annual income accurately.',
  4: 'Your pay frequency is used to annualize per-paycheck deductions like health insurance, so we can show accurate yearly totals.',
  5: 'This is your gross income before any taxes or deductions. We use it as the starting point for estimating your take-home pay.',
  6: 'We estimate federal and state taxes using 2025 US tax brackets. These are rough estimates — consult a tax professional for exact figures.',
  7: 'Pre-tax deductions reduce your taxable income. Common ones include retirement contributions (401k) and health insurance premiums.',
  8: 'This summary shows your estimated take-home pay after taxes and deductions. You can update any of these values later in Settings.',
};

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Currency
  const [currency, setCurrency] = useState('USD');

  // Step 2: Employment type
  const [employmentType, setEmploymentType] = useState('');

  // Step 3: Earning method
  const [earningMethod, setEarningMethod] = useState('');

  // Step 4: Pay frequency
  const [payFrequency, setPayFrequency] = useState('');

  // Step 5: Gross income
  const [annualSalary, setAnnualSalary] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');

  // Step 6: Tax
  const [stateTaxCode, setStateTaxCode] = useState('');

  // Step 7: Deductions (v2 format)
  const [retirementPercent, setRetirementPercent] = useState('');
  const [healthInsPerPaycheck, setHealthInsPerPaycheck] = useState('');
  const [otherDeductions, setOtherDeductions] = useState<OtherDeductionItem[]>([]);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
    { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
    { code: 'JPY', symbol: '\u00a5', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  ];

  const currencySymbol = currencies.find((c) => c.code === currency)?.symbol || '$';
  const isUSD = currency === 'USD';
  const multiplier = PAY_FREQUENCY_MULTIPLIERS[payFrequency] ?? 12;

  // Calculate actual step count (skip tax step for non-USD)
  const actualTotalSteps = isUSD ? TOTAL_STEPS : TOTAL_STEPS - 1;

  // Map displayed step to actual step (skip step 6 for non-USD)
  const getDisplayStep = (actualStep: number) => {
    if (!isUSD && actualStep >= 6) return actualStep - 1;
    return actualStep;
  };

  // Computed values
  const grossAnnual = useMemo(
    () => calculateGrossAnnual(earningMethod, parseCurrency(annualSalary), parseCurrency(hourlyRate), parseFloat(hoursPerWeek) || 0),
    [earningMethod, annualSalary, hourlyRate, hoursPerWeek]
  );

  const federalTax = useMemo(() => (isUSD ? calculateFederalTax(grossAnnual) : 0), [grossAnnual, isUSD]);
  const stateTax = useMemo(() => (isUSD ? calculateStateTax(grossAnnual, stateTaxCode) : 0), [grossAnnual, stateTaxCode, isUSD]);
  const socialSecurityTax = useMemo(() => (isUSD ? calculateSocialSecurityTax(grossAnnual) : 0), [grossAnnual, isUSD]);
  const medicareTax = useMemo(() => (isUSD ? calculateMedicareTax(grossAnnual) : 0), [grossAnnual, isUSD]);

  const retirePct = parseFloat(retirementPercent) || 0;
  const healthPP = parseCurrency(healthInsPerPaycheck);
  const retirementAnnual = retirementAnnualFromPercent(grossAnnual, retirePct);
  const healthAnnual = annualizePerPaycheck(healthPP, payFrequency);
  const otherAnnual = otherDeductions.reduce((sum, d) => sum + d.amountPerPaycheck, 0) * multiplier;
  const netAnnual = calculateNetAnnual(grossAnnual, federalTax, stateTax, socialSecurityTax, medicareTax, healthAnnual, retirementAnnual, otherAnnual);
  const netMonthly = netAnnual / 12;
  const effectiveFederalRate = grossAnnual > 0 ? ((federalTax / grossAnnual) * 100).toFixed(1) : '0';

  const handleNext = () => {
    if (step === 2 && !employmentType) {
      setError('Please select your employment type');
      return;
    }
    if (step === 3 && !earningMethod) {
      setError('Please select your earning method');
      return;
    }
    if (step === 4 && !payFrequency) {
      setError('Please select your pay frequency');
      return;
    }
    if (step === 5) {
      if (earningMethod === 'salaried' && (!annualSalary || parseCurrency(annualSalary) <= 0)) {
        setError('Please enter your annual salary');
        return;
      }
      if (earningMethod === 'hourly' && (!hourlyRate || parseCurrency(hourlyRate) <= 0)) {
        setError('Please enter your hourly rate');
        return;
      }
    }
    setError('');

    // Skip tax step for non-USD
    if (!isUSD && step === 5) {
      setStep(7);
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (!isUSD && step === 7) {
      setStep(5);
      return;
    }
    setStep(step - 1);
  };

  const addOtherDeduction = () => {
    if (otherDeductions.length >= 10) return;
    setOtherDeductions([...otherDeductions, { name: '', amountPerPaycheck: 0 }]);
  };

  const updateOtherDeduction = (index: number, field: keyof OtherDeductionItem, value: string) => {
    const updated = [...otherDeductions];
    if (field === 'name') {
      updated[index] = { ...updated[index], name: value };
    } else {
      updated[index] = { ...updated[index], amountPerPaycheck: parseCurrency(value) };
    }
    setOtherDeductions(updated);
  };

  const removeOtherDeduction = (index: number) => {
    setOtherDeductions(otherDeductions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await userApi.updatePreferences({ currency });
      await incomeApi.createOrUpdate({
        employmentType,
        earningMethod,
        payFrequency,
        annualSalary: earningMethod === 'salaried' ? parseCurrency(annualSalary) : undefined,
        hourlyRate: earningMethod === 'hourly' ? parseCurrency(hourlyRate) : undefined,
        hoursPerWeek: earningMethod === 'hourly' ? parseFloat(hoursPerWeek) || 0 : undefined,
        stateTaxCode: isUSD && stateTaxCode ? stateTaxCode : undefined,
        healthInsurancePerPaycheck: healthPP,
        retirementPercent: retirePct,
        otherDeductions: otherDeductions.filter((d) => d.name.trim() && d.amountPerPaycheck > 0),
      });
      await userApi.completeOnboarding();
      await refreshUser();
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save onboarding data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared Components ───────────────────────────────────────────────────────

  const StepHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2.5">
        <h1 className="font-serif font-light text-3xl md:text-4xl lg:text-5xl leading-tight text-secondary">
          {title}
        </h1>
        <InfoTooltip text={STEP_INFO[step]} />
      </div>
      <p className="text-sm md:text-base text-stone-text font-light max-w-xl">
        {subtitle}
      </p>
    </div>
  );

  const CardOption = ({
    selected,
    onClick,
    icon,
    title,
    subtitle,
  }: {
    selected: boolean;
    onClick: () => void;
    icon: string;
    title: string;
    subtitle: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 text-left hover:shadow-md hover:-translate-y-0.5 ${
        selected
          ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
          : 'border-stone-300/60 bg-white/60 backdrop-blur-sm hover:border-primary/50'
      }`}
    >
      <span className="material-symbols-outlined text-2xl mb-1.5 text-secondary">{icon}</span>
      <div className="font-medium text-base text-secondary">{title}</div>
      <div className="text-sm text-stone-text">{subtitle}</div>
    </button>
  );

  const ContinueButton = ({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) => (
    <button
      onClick={onClick || handleNext}
      disabled={disabled}
      className="group flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/90 disabled:bg-stone-400 disabled:cursor-not-allowed text-background-light pl-6 pr-5 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      <span className="text-base font-medium">Continue</span>
      <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
    </button>
  );

  const BackButton = () => (
    <button
      onClick={handleBack}
      disabled={loading}
      className="px-5 py-3 rounded-full border border-stone-300 text-stone-text hover:border-primary hover:text-secondary transition-colors disabled:opacity-50 text-sm"
    >
      Back
    </button>
  );

  // ─── Progress Indicator ──────────────────────────────────────────────────────

  const displayStep = getDisplayStep(step);

  const ProgressIndicator = () => (
    <div className="flex items-center gap-0 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-stone-300/60">
      <span className="text-sm font-medium text-stone-text mr-3">Step {displayStep} of {actualTotalSteps}</span>
      <div className="flex items-center">
        {Array.from({ length: actualTotalSteps }, (_, i) => i + 1).map((s) => (
          <React.Fragment key={s}>
            {s > 1 && (
              <div
                className={`w-3 h-0.5 transition-all duration-300 ${
                  s <= displayStep ? 'bg-primary/50' : 'bg-stone-300'
                }`}
              ></div>
            )}
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                s === displayStep
                  ? 'bg-primary shadow-sm shadow-primary/40 scale-125'
                  : s < displayStep
                  ? 'bg-primary/60'
                  : 'bg-stone-300'
              }`}
            ></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // ─── Step Renderer ─────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      // Step 1: Currency Selection — horizontal scroll
      case 1:
        return (
          <div key={1} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="What currency do you use?"
              subtitle="Choose the currency you earn and spend in. This determines display formatting."
            />
            <div
              className="flex gap-4 overflow-x-auto md:overflow-visible w-full px-2 py-2 justify-start md:flex-wrap md:justify-center"
              style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
            >
              {currencies.map((curr, i) => (
                <button
                  key={curr.code}
                  onClick={() => setCurrency(curr.code)}
                  className={`flex-shrink-0 w-36 md:w-44 p-5 md:p-6 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 fade-in-up ${
                    currency === curr.code
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                      : 'border-stone-300/60 bg-white/60 backdrop-blur-sm hover:border-primary/50'
                  }`}
                  style={{ animationDelay: `${i * 60}ms`, scrollSnapAlign: 'center' }}
                >
                  <div className="text-3xl mb-1.5 text-secondary">{curr.symbol}</div>
                  <div className="font-medium text-base text-secondary">{curr.code}</div>
                  <div className="text-sm text-stone-text">{curr.name}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <ContinueButton />
            </div>
          </div>
        );

      // Step 2: Employment Type
      case 2:
        return (
          <div key={2} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="What's your employment type?"
              subtitle="This helps us understand your income structure."
            />
            <StaggerChildren staggerMs={60}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <CardOption
                selected={employmentType === 'full-time'}
                onClick={() => setEmploymentType('full-time')}
                icon="work"
                title="Full-time"
                subtitle="40+ hours/week"
              />
              <CardOption
                selected={employmentType === 'part-time'}
                onClick={() => setEmploymentType('part-time')}
                icon="schedule"
                title="Part-time"
                subtitle="Less than 40 hours"
              />
              <CardOption
                selected={employmentType === 'intern'}
                onClick={() => setEmploymentType('intern')}
                icon="school"
                title="Intern"
                subtitle="Internship position"
              />
            </div>
            </StaggerChildren>
            <div className="flex gap-4 mt-8">
              <BackButton />
              <ContinueButton disabled={!employmentType} />
            </div>
          </div>
        );

      // Step 3: Earning Method
      case 3:
        return (
          <div key={3} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="How are you compensated?"
              subtitle="How you're compensated determines how we calculate your gross income."
            />
            <StaggerChildren staggerMs={60}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
              <CardOption
                selected={earningMethod === 'salaried'}
                onClick={() => setEarningMethod('salaried')}
                icon="payments"
                title="Salaried"
                subtitle="Fixed annual salary"
              />
              <CardOption
                selected={earningMethod === 'hourly'}
                onClick={() => setEarningMethod('hourly')}
                icon="timer"
                title="Hourly"
                subtitle="Paid by the hour"
              />
            </div>
            </StaggerChildren>
            <div className="flex gap-4 mt-8">
              <BackButton />
              <ContinueButton disabled={!earningMethod} />
            </div>
          </div>
        );

      // Step 4: Pay Frequency
      case 4:
        return (
          <div key={4} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="How often do you get paid?"
              subtitle="We use this to annualize your per-paycheck deductions."
            />
            <StaggerChildren staggerMs={60}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <CardOption
                selected={payFrequency === 'weekly'}
                onClick={() => setPayFrequency('weekly')}
                icon="event"
                title="Weekly"
                subtitle="Every week (52x/year)"
              />
              <CardOption
                selected={payFrequency === 'bi-weekly'}
                onClick={() => setPayFrequency('bi-weekly')}
                icon="date_range"
                title="Bi-weekly"
                subtitle="Every two weeks (26x/year)"
              />
              <CardOption
                selected={payFrequency === 'semi-monthly'}
                onClick={() => setPayFrequency('semi-monthly')}
                icon="calendar_month"
                title="Semi-monthly"
                subtitle="Twice a month (24x/year)"
              />
              <CardOption
                selected={payFrequency === 'monthly'}
                onClick={() => setPayFrequency('monthly')}
                icon="today"
                title="Monthly"
                subtitle="Once a month (12x/year)"
              />
            </div>
            </StaggerChildren>
            <div className="flex gap-4 mt-8">
              <BackButton />
              <ContinueButton disabled={!payFrequency} />
            </div>
          </div>
        );

      // Step 5: Gross Income
      case 5:
        return (
          <div key={5} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title={earningMethod === 'salaried' ? "What's your annual salary?" : "What's your hourly rate?"}
              subtitle="Starting point for estimating your take-home pay."
            />
            <div className="w-full max-w-xl mt-2">
              {earningMethod === 'salaried' ? (
                <div className="relative group">
                  <div className="w-full pb-2 border-b border-stone-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0 group-focus-within:after:w-full after:transition-all after:duration-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl md:text-4xl text-primary font-serif">{currencySymbol}</span>
                      <input
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        value={annualSalary}
                        onChange={(e) => setAnnualSalary(formatCurrency(e.target.value))}
                        placeholder="0.00"
                        className="w-full bg-transparent border-none p-0 text-2xl md:text-3xl text-center placeholder:text-stone-400 focus:ring-0 text-primary font-serif"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-stone-text font-light">
                    Your gross annual salary before taxes and deductions.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="relative group">
                    <label className="block text-sm text-stone-text mb-2">Hourly Rate</label>
                    <div className="w-full pb-2 border-b border-stone-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0 group-focus-within:after:w-full after:transition-all after:duration-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl md:text-3xl text-primary font-serif">{currencySymbol}</span>
                        <input
                          autoFocus
                          type="text"
                          inputMode="numeric"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(formatCurrency(e.target.value))}
                          placeholder="0.00"
                          className="w-full bg-transparent border-none p-0 text-xl md:text-2xl text-center placeholder:text-stone-400 focus:ring-0 text-primary font-serif"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <label className="block text-sm text-stone-text mb-2">Hours per Week</label>
                    <div className="w-full pb-2 border-b border-stone-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0 group-focus-within:after:w-full after:transition-all after:duration-500">
                      <input
                        type="number"
                        value={hoursPerWeek}
                        onChange={(e) => setHoursPerWeek(e.target.value)}
                        placeholder="40"
                        min="1"
                        max="168"
                        className="w-full bg-transparent border-none p-0 text-xl md:text-2xl text-center placeholder:text-stone-400 focus:ring-0 text-primary font-serif"
                      />
                    </div>
                  </div>
                  {grossAnnual > 0 && (
                    <p className="text-base text-stone-text">
                      Estimated annual: <span className="font-medium text-secondary">{currencySymbol}{formatMoney(grossAnnual)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-8">
              <BackButton />
              <ContinueButton
                disabled={
                  earningMethod === 'salaried'
                    ? !annualSalary || parseCurrency(annualSalary) <= 0
                    : !hourlyRate || parseCurrency(hourlyRate) <= 0
                }
              />
            </div>
          </div>
        );

      // Step 6: Tax Estimation (USD only)
      case 6:
        return (
          <div key={6} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="Tax estimation"
              subtitle="We'll estimate your taxes using 2025 US federal brackets. Select your state for a more accurate estimate."
            />

            <div className="w-full max-w-xl space-y-4 mt-2">
              {/* Federal income tax display */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60">
                <div className="flex justify-between items-center">
                  <span className="text-stone-text">
                    Federal Income Tax ({effectiveFederalRate}% effective)
                  </span>
                  <span className="font-serif text-lg text-secondary">${formatMoney(federalTax)}</span>
                </div>
              </div>

              {/* State selection */}
              <div>
                <label className="block text-sm text-stone-text mb-2">
                  State (optional)
                </label>
                <select
                  value={stateTaxCode}
                  onChange={(e) => setStateTaxCode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  <option value="">No state tax / Not in US</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {stateTaxCode && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-text">State Tax (estimated)</span>
                    <span className="font-serif text-lg text-secondary">${formatMoney(stateTax)}</span>
                  </div>
                </div>
              )}

              {/* Total tax */}
              <div className="bg-secondary/5 rounded-2xl p-5 md:p-6 border border-secondary/20">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-secondary">Total Estimated Tax</span>
                  <span className="font-serif text-xl text-primary">${formatMoney(federalTax + stateTax)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <BackButton />
              <ContinueButton />
            </div>
          </div>
        );

      // Step 7: Deductions (v2)
      case 7:
        return (
          <div key={7} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="Pre-tax deductions"
              subtitle="Enter your deductions below. Leave blank if you're unsure — you can update these later in Settings."
            />

            <StaggerChildren staggerMs={60}>
            <div className="w-full max-w-xl space-y-4 mt-2 text-left">
              {/* Retirement (401k) — percentage */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60 space-y-3">
                <label className="text-sm font-medium text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg text-stone-400">savings</span>
                  Retirement (401k)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={retirementPercent}
                    onChange={(e) => setRetirementPercent(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full pr-10 pl-4 py-2.5 bg-white border border-stone-300 rounded-lg text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">%</span>
                </div>
                {retirePct > 0 && grossAnnual > 0 && (
                  <p className="text-xs text-stone-text">
                    ≈ {currencySymbol}{formatMoney(retirementAnnual)}/year
                  </p>
                )}
              </div>

              {/* Health Insurance — per-paycheck */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60 space-y-3">
                <label className="text-sm font-medium text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg text-stone-400">health_and_safety</span>
                  Health Insurance
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">{currencySymbol}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={healthInsPerPaycheck}
                    onChange={(e) => setHealthInsPerPaycheck(formatCurrency(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-10 pr-24 py-2.5 bg-white border border-stone-300 rounded-lg text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">/ paycheck</span>
                </div>
                {healthPP > 0 && (
                  <p className="text-xs text-stone-text">
                    ≈ {currencySymbol}{formatMoney(healthAnnual)}/year
                  </p>
                )}
              </div>

              {/* Other Deductions — key-value list */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60 space-y-3">
                <label className="text-sm font-medium text-secondary flex items-center gap-1">
                  <span className="material-symbols-outlined text-lg text-stone-400">receipt_long</span>
                  Other Deductions
                </label>

                {otherDeductions.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateOtherDeduction(idx, 'name', e.target.value)}
                      placeholder="Name (e.g. HSA)"
                      className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-secondary placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">{currencySymbol}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={item.amountPerPaycheck > 0 ? formatCurrency(Math.round(item.amountPerPaycheck * 100).toString()) : ''}
                        onChange={(e) => updateOtherDeduction(idx, 'amountPerPaycheck', e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 bg-white border border-stone-300 rounded-lg text-sm text-secondary placeholder:text-stone-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOtherDeduction(idx)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}

                {otherDeductions.length < 10 && (
                  <button
                    type="button"
                    onClick={addOtherDeduction}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-full hover:bg-primary/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add deduction
                  </button>
                )}

                {otherAnnual > 0 && (
                  <p className="text-xs text-stone-text">
                    Total other: ≈ {currencySymbol}{formatMoney(otherAnnual)}/year
                  </p>
                )}
              </div>
            </div>
            </StaggerChildren>

            <div className="flex gap-4 mt-8">
              <BackButton />
              <ContinueButton />
            </div>
          </div>
        );

      // Step 8: Net Income Summary
      case 8:
        return (
          <form key={8} onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col items-center gap-8 text-center slide-in-right">
            <StepHeading
              title="Your income summary"
              subtitle="Here's your estimated take-home pay breakdown."
            />

            <StaggerChildren staggerMs={60}>
            <div className="w-full max-w-xl space-y-3 mt-2">
              {/* Gross Income */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60">
                <div className="flex justify-between items-center">
                  <span className="text-stone-text">Gross Annual Income</span>
                  <span className="font-serif text-lg text-secondary">{currencySymbol}{formatMoney(grossAnnual)}</span>
                </div>
              </div>

              {/* Deductions breakdown */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-stone-300/60 space-y-2.5">
                <div className="text-sm font-medium text-stone-text text-left mb-1">Deductions</div>
                {isUSD && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-text">Federal Income Tax ({effectiveFederalRate}% effective)</span>
                      <span className="text-red-600">-{currencySymbol}{formatMoney(federalTax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-text">Social Security (6.2%)</span>
                      <span className="text-red-600">-{currencySymbol}{formatMoney(socialSecurityTax)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-text">Medicare (1.45%)</span>
                      <span className="text-red-600">-{currencySymbol}{formatMoney(medicareTax)}</span>
                    </div>
                    {stateTax > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-text">State Tax ({stateTaxCode})</span>
                        <span className="text-red-600">-{currencySymbol}{formatMoney(stateTax)}</span>
                      </div>
                    )}
                  </>
                )}
                {retirementAnnual > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-text">Retirement ({retirePct}%)</span>
                    <span className="text-red-600">-{currencySymbol}{formatMoney(retirementAnnual)}</span>
                  </div>
                )}
                {healthAnnual > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-text">Health Insurance ({currencySymbol}{formatMoney(healthPP)}/paycheck)</span>
                    <span className="text-red-600">-{currencySymbol}{formatMoney(healthAnnual)}</span>
                  </div>
                )}
                {otherDeductions.filter((d) => d.amountPerPaycheck > 0 && d.name.trim()).map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-stone-text">{d.name}</span>
                    <span className="text-red-600">-{currencySymbol}{formatMoney(d.amountPerPaycheck * multiplier)}</span>
                  </div>
                ))}
              </div>

              {/* Net Income */}
              <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-2xl p-5 border border-secondary/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-secondary">Net Annual Income</span>
                  <span className="font-serif text-xl text-primary">{currencySymbol}{formatMoney(netAnnual)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-text">Monthly Take-Home</span>
                  <span className="font-serif text-lg text-secondary">{currencySymbol}{formatMoney(netMonthly)}</span>
                </div>
              </div>
            </div>
            </StaggerChildren>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm max-w-xl">
                {error}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <BackButton />
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/90 disabled:bg-stone-400 disabled:cursor-not-allowed text-background-light pl-6 pr-5 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span className="text-base font-medium">{loading ? 'Saving...' : 'Get Started'}</span>
                {!loading && (
                  <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-background-light flex flex-col transition-colors duration-300 relative overflow-hidden">
      <header className="w-full px-6 py-5 md:px-12 md:py-6 flex justify-between items-center z-10">
        <Logo className="h-10 md:h-12" showText={true} />

        {/* Progress indicator with connecting lines */}
        <div className="absolute left-1/2 top-6 -translate-x-1/2 hidden md:block">
          <ProgressIndicator />
        </div>

        <button
          onClick={() => navigate('/app/dashboard')}
          className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
        >
          Skip for now
        </button>
      </header>

      {/* Mobile progress indicator */}
      <div className="flex justify-center md:hidden -mt-2 mb-2 z-10">
        <ProgressIndicator />
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 pb-16 z-10">
        {/* Background parallax blobs */}
        <div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `translate(${step * 20}px, ${step * -10}px)` }}
        ></div>
        <div
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 ease-out"
          style={{ transform: `translate(${step * -15}px, ${step * 12}px)` }}
        ></div>

        {error && step !== 8 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm max-w-xl mb-4">
            {error}
          </div>
        )}

        {renderStep()}
      </main>

      <footer className="w-full py-6 text-center opacity-40 hover:opacity-80 transition-opacity">
        <p className="text-xs font-serif italic max-w-md mx-auto px-6">
          "Money is a terrible master but an excellent servant." — P.T. Barnum
        </p>
      </footer>
    </div>
  );
};

export default Onboarding;
