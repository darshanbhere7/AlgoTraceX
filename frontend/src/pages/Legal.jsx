import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import LandingNavbar from "../components/home/LandingNavbar.jsx";
import LandingFooter from "../components/home/LandingFooter.jsx";
import { AuroraBackground } from "../components/ui/aurora-background";

const sections = [
  {
    id: "privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, use, and safeguard your personal data.",
    content: [
      "We collect only the information necessary to create and maintain your AlgoTraceX experience — this includes account details, learning preferences, and performance analytics across our tools.",
      "Your data is encrypted in transit and at rest. Access is limited to vetted personnel under strict confidentiality agreements and role-based controls.",
      "We never sell personal data. Limited third-party sharing happens only with infrastructure partners (hosting, email, analytics) who are bound by equivalent privacy and security obligations.",
      "You can request data export, correction, or deletion at any time by emailing privacy@algotracex.com. We respond within 30 days unless law requires otherwise.",
      "We retain learning analytics for up to 24 months to power personalized recommendations. Deleted accounts are purged from active systems within 72 hours and from backups within 30 days.",
    ],
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    subtitle: "The rules that govern your use of AlgoTraceX products and services.",
    content: [
      "AlgoTraceX grants you a non-transferable, revocable license to access the platform strictly for educational and lawful purposes. Automated scraping, reverse engineering, or reselling content is prohibited.",
      "You are responsible for safeguarding login credentials and for all activity that occurs under your account. Notify support immediately of any suspected breach.",
      "Subscriptions renew automatically unless cancelled before the renewal date. Fees are non-refundable except where required by applicable law or explicitly stated in a plan.",
      "All visualizers, lesson content, and AI outputs remain the intellectual property of AlgoTraceX. Limited reproduction is allowed for academic, non-commercial use with attribution.",
      "We may suspend or terminate access for violations of these terms, abusive conduct, or security threats. We will provide notice when practicable and offer a remediation path when appropriate.",
    ],
  },
];

const Legal = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.replace("#", ""));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location]);

  return (
    <div className="home-page min-h-screen bg-white dark:bg-neutral-900">
      <LandingNavbar />
      <main className="pt-24">

        <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
          {sections.map((section, idx) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-lg p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                  Section {idx + 1}
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-neutral-800" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{section.subtitle}</p>
              <ul className="space-y-4 text-gray-700 dark:text-gray-200 leading-relaxed">
                {section.content.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-8 text-center"
          >
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Need Clarification?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Reach out to legal@algotracex.com for contract requests, compliance documentation, or privacy
              inquiries. We usually respond within two business days.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:legal@algotracex.com"
                className="px-5 py-2 rounded-full text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 transition hover:translate-y-0.5"
              >
                Contact Legal
              </a>
              <a
                href="mailto:privacy@algotracex.com"
                className="px-5 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white transition hover:translate-y-0.5"
              >
                Privacy Requests
              </a>
            </div>
          </motion.div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export default Legal;

