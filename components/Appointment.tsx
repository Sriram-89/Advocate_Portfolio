'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Briefcase, CheckCircle, Loader2 } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { advocate } from '@/config/advocate';

const timeSlots = [
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','02:00 PM','02:30 PM',
  '03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM',
];

interface FormData {
  name: string; phone: string; email: string;
  date: string; time: string; caseType: string;
}

export default function Appointment() {
  const { t } = useLang();
  const [form, setForm] = useState<FormData>({ name:'', phone:'', email:'', date:'', time:'', caseType:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || `Booking failed. Please call us at ${advocate.phones[0]}.`);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-white dark:bg-charcoal-mid border border-gray-200 dark:border-gray-700 
    text-charcoal dark:text-white px-4 py-3 text-sm focus:outline-none focus:border-gold 
    transition-colors duration-200 placeholder-gray-400 dark:placeholder-gray-600`;
  const labelClass = `block text-xs tracking-wider uppercase text-slate dark:text-gray-400 font-medium mb-2`;

  if (success) {
    return (
      <section id="appointment" className="section-padding bg-charcoal">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 border border-gold mb-8">
            <CheckCircle size={36} className="text-gold" />
          </div>
          <h2 className="font-display text-3xl text-white font-semibold mb-4">{t.appointment.successTitle}</h2>
          <p className="text-gray-400 leading-relaxed mb-2">
            {t.appointment.successMsg1.replace('{{name}}', '')} <strong className="text-gold">{form.name}</strong>.{' '}
            {t.appointment.successMsg1}
          </p>
          <p className="text-gray-400 text-sm mb-8">
            {t.appointment.successMsg2}{' '}<strong className="text-white">{form.phone}</strong>{' '}
            {t.appointment.successMsg3}{' '}<strong className="text-white">{form.date}</strong>{' '}
            {t.appointment.successMsg4}{' '}<strong className="text-white">{form.time}</strong>.
          </p>
          <div className="bg-charcoal-mid border border-gold/20 p-5 text-left mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">{t.appointment.summaryTitle}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-500">{t.appointment.caseTypeRow}</span><span className="text-white">{form.caseType}</span>
              <span className="text-gray-500">{t.appointment.dateRow}</span><span className="text-white">{form.date}</span>
              <span className="text-gray-500">{t.appointment.timeRow}</span><span className="text-white">{form.time}</span>
            </div>
          </div>
          <a href="#contact" className="btn-gold inline-block">{t.appointment.viewContactBtn}</a>
        </div>
      </section>
    );
  }

  return (
    <section id="appointment" className="section-padding bg-charcoal">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left: Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-xs tracking-widest uppercase font-medium">{t.appointment.eyebrow}</span>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl text-white font-semibold mb-6">{t.appointment.title}</h2>
            <p className="text-gray-400 leading-relaxed mb-10">{t.appointment.subtitle}</p>

            <div className="space-y-5">
              {[
                { icon: User, title: t.appointment.personalConsult, desc: t.appointment.personalConsultDesc },
                { icon: Briefcase, title: t.appointment.caseAssess, desc: t.appointment.caseAssessDesc },
                { icon: Clock, title: t.appointment.timelyResp, desc: t.appointment.timelyRespDesc },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-gold" />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-semibold mb-1">{title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 border border-gold/20 p-5">
              <h4 className="text-gold text-xs uppercase tracking-widest font-medium mb-4">{t.appointment.hoursTitle}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.appointment.weekdays}</span>
                  <span className="text-white">{advocate.workingHours.appointmentSlots.weekdays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.appointment.saturday}</span>
                  <span className="text-white">{advocate.workingHours.appointmentSlots.saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.appointment.sunday}</span>
                  <span className="text-gray-600">{t.appointment.closed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white dark:bg-charcoal-mid border border-gray-100 dark:border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}><User size={11} className="inline mr-1" />{t.appointment.nameLabel} *</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t.appointment.namePlaceholder} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Phone size={11} className="inline mr-1" />{t.appointment.phoneLabel} *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder={t.appointment.phonePlaceholder} required maxLength={10} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Mail size={11} className="inline mr-1" />{t.appointment.emailLabel}</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t.appointment.emailPlaceholder} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><Calendar size={11} className="inline mr-1" />{t.appointment.dateLabel} *</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} min={today} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Clock size={11} className="inline mr-1" />{t.appointment.timeLabel} *</label>
                  <select name="time" value={form.time} onChange={handleChange} required className={inputClass}>
                    <option value="">{t.appointment.selectTime}</option>
                    {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}><Briefcase size={11} className="inline mr-1" />{t.appointment.caseTypeLabel} *</label>
                <select name="caseType" value={form.caseType} onChange={handleChange} required className={inputClass}>
                  <option value="">{t.appointment.selectCase}</option>
                  {t.appointment.caseTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                {loading ? t.appointment.submittingBtn : t.appointment.submitBtn}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">{t.appointment.consentNote}</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
