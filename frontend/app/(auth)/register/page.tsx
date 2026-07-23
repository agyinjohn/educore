'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { tenantService } from '@/lib/services/tenant.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Check, Building2, PartyPopper, User, Mail, Lock, Phone, MapPin, Globe } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Strength = 'weak' | 'fair' | 'strong';

interface AccountForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface SchoolForm {
  name: string;
  subdomain: string;
  phone: string;
  email: string;
  country: string;
  address: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const strengthMap: Record<Strength, { label: string; color: string; width: string }> = {
  weak:   { label: 'Weak',   color: 'bg-red-500',     width: 'w-1/3' },
  fair:   { label: 'Fair',   color: 'bg-yellow-500',  width: 'w-2/3' },
  strong: { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' },
};

function getStrength(pw: string): Strength {
  if (pw.length < 8) return 'weak';
  const hasUpper   = /[A-Z]/.test(pw);
  const hasNum     = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  if (hasUpper && hasNum && hasSpecial) return 'strong';
  return 'fair';
}

function toSubdomain(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ['Your account', 'School details', 'All set!'];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const idx  = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done   ? 'bg-emerald-500 text-white' :
                active ? 'bg-blue-600 text-white'    :
                         'bg-gray-100 text-gray-400'
              }`}>
                {done ? <Check className="w-3.5 h-3.5" /> : idx}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px transition-colors ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [account, setAccount] = useState<AccountForm>({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof AccountForm, string>>>({});

  const [school, setSchool] = useState<SchoolForm>({
    name: '', subdomain: '', phone: '', email: '', country: 'GH', address: '',
  });
  const [schoolErrors, setSchoolErrors] = useState<Partial<Record<keyof SchoolForm, string>>>({});

  const strength = account.password ? getStrength(account.password) : null;

  // ── Setters ──
  const setAcc = (field: keyof AccountForm, value: string | boolean) => {
    setAccount((p) => ({ ...p, [field]: value }));
    if (accountErrors[field]) setAccountErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const setSch = (field: keyof SchoolForm, value: string) => {
    setSchool((p) => ({ ...p, [field]: value }));
    if (schoolErrors[field]) setSchoolErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleSchoolName = (value: string) => {
    setSch('name', value);
    if (!school.subdomain || school.subdomain === toSubdomain(school.name)) {
      setSch('subdomain', toSubdomain(value));
    }
  };

  // ── Validation ──
  const validateAccount = (): boolean => {
    const e: Partial<Record<keyof AccountForm, string>> = {};
    if (!account.firstName.trim()) e.firstName = 'Required';
    if (!account.lastName.trim())  e.lastName  = 'Required';
    if (!account.email)            e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) e.email = 'Enter a valid email';
    if (!account.password)         e.password = 'Required';
    else if (account.password.length < 8)            e.password = 'Min. 8 characters';
    else if (!/[A-Z]/.test(account.password))         e.password = 'Add an uppercase letter';
    else if (!/[0-9]/.test(account.password))         e.password = 'Add a number';
    else if (!/[^A-Za-z0-9]/.test(account.password)) e.password = 'Add a special character (!@#$...)';
    if (account.password !== account.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!account.agreeToTerms) e.agreeToTerms = 'You must accept the terms';
    setAccountErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSchool = (): boolean => {
    const e: Partial<Record<keyof SchoolForm, string>> = {};
    if (!school.name.trim())      e.name      = 'Required';
    if (!school.subdomain.trim()) e.subdomain = 'Required';
    else if (!/^[a-z0-9-]+$/.test(school.subdomain)) e.subdomain = 'Only lowercase letters, numbers and hyphens';
    if (!school.country.trim())   e.country   = 'Required';
    setSchoolErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 1: create account + auto-login ──
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccount()) return;
    setIsLoading(true);
    try {
      await authService.register({ email: account.email, password: account.password, role: 'SCHOOL_OWNER' });
      await authService.login({ email: account.email, password: account.password });
      setStep(2);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: create school ──
  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSchool()) return;
    setIsLoading(true);
    try {
      await tenantService.createSchool({
        name:      school.name,
        subdomain: school.subdomain,
        country:   school.country,
        phone:     school.phone   || undefined,
        email:     school.email   || undefined,
        address:   school.address || undefined,
      });
      setStep(3);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create school. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <Steps current={step} />

      {/* ── Step 1: Account ── */}
      {step === 1 && (
        <div className="space-y-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Start with your personal admin credentials.</p>
          </div>

          <form onSubmit={handleAccountSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  First name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="John"
                    value={account.firstName}
                    onChange={(e) => setAcc('firstName', e.target.value)}
                    disabled={isLoading}
                    className={`h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${accountErrors.firstName ? 'border-red-400' : ''}`}
                  />
                </div>
                {accountErrors.firstName && <p className="text-xs text-red-500">{accountErrors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="Doe"
                    value={account.lastName}
                    onChange={(e) => setAcc('lastName', e.target.value)}
                    disabled={isLoading}
                    className={`h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${accountErrors.lastName ? 'border-red-400' : ''}`}
                  />
                </div>
                {accountErrors.lastName && <p className="text-xs text-red-500">{accountErrors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Work email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="you@school.com"
                  value={account.email}
                  onChange={(e) => setAcc('email', e.target.value)}
                  disabled={isLoading}
                  className={`h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${accountErrors.email ? 'border-red-400' : ''}`}
                />
              </div>
              {accountErrors.email && <p className="text-xs text-red-500">{accountErrors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={account.password}
                  onChange={(e) => setAcc('password', e.target.value)}
                  disabled={isLoading}
                  className={`h-11 pl-10 pr-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${accountErrors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="space-y-1 pt-0.5">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthMap[strength].color} ${strengthMap[strength].width}`} />
                  </div>
                  <p className={`text-xs font-medium ${
                    strength === 'weak' ? 'text-red-500' : strength === 'fair' ? 'text-yellow-600' : 'text-emerald-600'
                  }`}>{strengthMap[strength].label} password</p>
                </div>
              )}
              {accountErrors.password && <p className="text-xs text-red-500">{accountErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Confirm password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={account.confirmPassword}
                  onChange={(e) => setAcc('confirmPassword', e.target.value)}
                  disabled={isLoading}
                  className={`h-11 pl-10 pr-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${accountErrors.confirmPassword ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {account.confirmPassword && account.password === account.confirmPassword && (
                  <div className="absolute right-9 top-1/2 -translate-y-1/2">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </div>
              {accountErrors.confirmPassword && <p className="text-xs text-red-500">{accountErrors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="space-y-1">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={account.agreeToTerms}
                  onChange={(e) => setAcc('agreeToTerms', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 font-normal cursor-pointer leading-relaxed">
                  I agree to EduCore's{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
                </Label>
              </div>
              {accountErrors.agreeToTerms && <p className="text-xs text-red-500 pl-6">{accountErrors.agreeToTerms}</p>}
            </div>

            <Button type="submit" disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg">
              {isLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                : 'Continue →'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link>
          </p>
        </div>
      )}

      {/* ── Step 2: School Details ── */}
      {step === 2 && (
        <div className="space-y-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Set up your school</h2>
            </div>
            <p className="text-gray-500 text-sm">Tell us about your institution. You can update this later in Settings.</p>
          </div>

          <form onSubmit={handleSchoolSubmit} className="space-y-4">
            {/* School name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                School name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Springfield Academy"
                  value={school.name}
                  onChange={(e) => handleSchoolName(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${schoolErrors.name ? 'border-red-400' : ''}`}
                />
              </div>
              {schoolErrors.name && <p className="text-xs text-red-500">{schoolErrors.name}</p>}
            </div>

            {/* Subdomain */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Subdomain <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center">
                <Input
                  placeholder="springfield-academy"
                  value={school.subdomain}
                  onChange={(e) => setSch('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  disabled={isLoading}
                  className={`h-11 rounded-r-none border-r-0 focus-visible:ring-blue-500/25 focus-visible:border-blue-500 ${schoolErrors.subdomain ? 'border-red-400' : ''}`}
                />
                <span className="h-11 px-3 flex items-center bg-gray-50 border border-gray-300 rounded-r-lg text-sm text-gray-500 whitespace-nowrap">
                  .educore.app
                </span>
              </div>
              {schoolErrors.subdomain
                ? <p className="text-xs text-red-500">{schoolErrors.subdomain}</p>
                : school.subdomain && <p className="text-xs text-gray-400">Your portal: {school.subdomain}.educore.app</p>
              }
            </div>

            {/* Country + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={school.country}
                    onChange={(e) => setSch('country', e.target.value)}
                    disabled={isLoading}
                    className="w-full h-11 border border-gray-300 rounded-md pl-10 pr-3 text-sm focus:outline-none focus:ring-3 focus:ring-blue-500/25 focus:border-blue-500 bg-white appearance-none"
                  >
                    <option value="GH">Ghana</option>
                    <option value="NG">Nigeria</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    type="tel"
                    placeholder="+233 00 000 0000"
                    value={school.phone}
                    onChange={(e) => setSch('phone', e.target.value)}
                    disabled={isLoading}
                    className="h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* School email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">School email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="info@school.com"
                  value={school.email}
                  onChange={(e) => setSch('email', e.target.value)}
                  disabled={isLoading}
                  className="h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="123 School Road, City"
                  value={school.address}
                  onChange={(e) => setSch('address', e.target.value)}
                  disabled={isLoading}
                  className="h-11 pl-10 focus-visible:ring-blue-500/25 focus-visible:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading}
                className="h-11 border-gray-300 text-gray-600">
                ← Back
              </Button>
              <Button type="submit" disabled={isLoading}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg">
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating school...</>
                  : 'Create school →'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className="space-y-8 text-center py-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="font-semibold text-gray-800">{school.name}</span> has been created.<br />
              Sign in to access your dashboard and start managing your school.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Your portal</p>
            <p className="text-sm font-semibold text-blue-600">{school.subdomain}.educore.app</p>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg"
          >
            Go to sign in
          </Button>
        </div>
      )}
    </div>
  );
}
