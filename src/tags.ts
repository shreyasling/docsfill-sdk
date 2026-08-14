/**
 * DocFill shared tag registry (v2) — the single source of truth for the tag
 * vocabulary across docfill-sdk, docfill-pwa, and the backend.
 *
 * Rules:
 * - Tag format: `namespace.field`, lowercase, dot-separated.
 * - Each tag is `text` or `file`. Text tags fill `.value`; file tags load a file.
 * - `computed` tags are derived at fill-time (e.g. age from dob) and never stored.
 * - `multi` tags may have several instances (payload may carry an array, or use a
 *   `.1`/`.2` suffix on the tag).
 * - Add tags here AND in the PWA vault together; bump TAG_SCHEMA_VERSION.
 */

export const TAG_SCHEMA_VERSION = 2;

export interface TagDef {
  tag: string;
  label: string;
  group: string;
  type: 'text' | 'file';
  /** Regex source (no slashes) validating a text value. */
  validation?: string;
  /** Derived at fill-time; never stored. */
  computed?: boolean;
  /** May have multiple instances. */
  multi?: boolean;
}

export const DOCFILL_TAGS = [
  // ── identity (text) ──────────────────────────────────────────────
  { tag: 'identity.full_name', label: 'Full Name', group: 'identity', type: 'text' },
  { tag: 'identity.father_name', label: "Father's Name", group: 'identity', type: 'text' },
  { tag: 'identity.mother_name', label: "Mother's Name", group: 'identity', type: 'text' },
  { tag: 'identity.spouse_name', label: "Spouse's Name", group: 'identity', type: 'text' },
  { tag: 'identity.dob', label: 'Date of Birth', group: 'identity', type: 'text',
    validation: '^\\d{4}-\\d{2}-\\d{2}$' },
  { tag: 'identity.gender', label: 'Gender', group: 'identity', type: 'text' },
  { tag: 'identity.nationality', label: 'Nationality', group: 'identity', type: 'text' },
  { tag: 'identity.marital_status', label: 'Marital Status', group: 'identity', type: 'text' },
  { tag: 'identity.religion', label: 'Religion', group: 'identity', type: 'text' },
  { tag: 'identity.category', label: 'Category (GEN/OBC/SC/ST/EWS)', group: 'identity', type: 'text' },
  { tag: 'identity.pan', label: 'PAN', group: 'identity', type: 'text',
    validation: '^[A-Z]{5}[0-9]{4}[A-Z]$' },
  { tag: 'identity.aadhaar', label: 'Aadhaar Number', group: 'identity', type: 'text',
    validation: '^[0-9]{12}$' },
  { tag: 'identity.passport_number', label: 'Passport Number', group: 'identity', type: 'text',
    validation: '^[A-Z][0-9]{7}$' },
  { tag: 'identity.voter_id', label: 'Voter ID Number', group: 'identity', type: 'text',
    validation: '^[A-Z]{3}[0-9]{7}$' },
  { tag: 'identity.driving_license_number', label: 'Driving License Number', group: 'identity', type: 'text' },

  // ── identity documents (file) ────────────────────────────────────
  { tag: 'identity.aadhaar_card', label: 'Aadhaar Card', group: 'identity', type: 'file' },
  { tag: 'identity.pan_card', label: 'PAN Card', group: 'identity', type: 'file' },
  { tag: 'identity.passport', label: 'Passport', group: 'identity', type: 'file' },
  { tag: 'identity.voter_id_card', label: 'Voter ID Card', group: 'identity', type: 'file' },
  { tag: 'identity.driving_license', label: 'Driving License', group: 'identity', type: 'file' },
  { tag: 'identity.ration_card', label: 'Ration Card', group: 'identity', type: 'file' },
  { tag: 'identity.birth_certificate', label: 'Birth Certificate', group: 'identity', type: 'file' },

  // ── contact (text) ───────────────────────────────────────────────
  { tag: 'contact.email', label: 'Email', group: 'contact', type: 'text',
    validation: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
  { tag: 'contact.phone', label: 'Phone', group: 'contact', type: 'text',
    validation: '^[6-9][0-9]{9}$' },
  { tag: 'contact.alt_phone', label: 'Alternate Phone', group: 'contact', type: 'text',
    validation: '^[6-9][0-9]{9}$' },

  // ── address (text + file) ────────────────────────────────────────
  { tag: 'address.current', label: 'Current Address', group: 'address', type: 'text' },
  { tag: 'address.permanent', label: 'Permanent Address', group: 'address', type: 'text' },
  { tag: 'address.city', label: 'City', group: 'address', type: 'text' },
  { tag: 'address.state', label: 'State', group: 'address', type: 'text' },
  { tag: 'address.country', label: 'Country', group: 'address', type: 'text' },
  { tag: 'address.pincode', label: 'PIN Code', group: 'address', type: 'text',
    validation: '^[1-9][0-9]{5}$' },
  { tag: 'address.proof', label: 'Address Proof', group: 'address', type: 'file' },

  // ── education (text) ─────────────────────────────────────────────
  { tag: 'education.10th_percentage', label: '10th Percentage', group: 'education', type: 'text' },
  { tag: 'education.12th_percentage', label: '12th Percentage', group: 'education', type: 'text' },
  { tag: 'education.degree', label: 'Degree', group: 'education', type: 'text' },
  { tag: 'education.degree_cgpa', label: 'Degree CGPA', group: 'education', type: 'text' },
  { tag: 'education.university', label: 'University / Board', group: 'education', type: 'text' },
  { tag: 'education.graduation_year', label: 'Graduation Year', group: 'education', type: 'text',
    validation: '^(19|20)[0-9]{2}$' },

  // ── education documents (file) ───────────────────────────────────
  { tag: 'education.10th_marksheet', label: '10th Marksheet', group: 'education', type: 'file' },
  { tag: 'education.12th_marksheet', label: '12th Marksheet', group: 'education', type: 'file' },
  { tag: 'education.degree_certificate', label: 'Degree Certificate', group: 'education', type: 'file' },
  { tag: 'education.degree_marksheet', label: 'Degree Marksheet', group: 'education', type: 'file', multi: true },
  { tag: 'education.transfer_certificate', label: 'Transfer Certificate', group: 'education', type: 'file' },
  { tag: 'education.migration_certificate', label: 'Migration Certificate', group: 'education', type: 'file' },

  // ── employment (text) ────────────────────────────────────────────
  { tag: 'employment.employer', label: 'Employer', group: 'employment', type: 'text' },
  { tag: 'employment.designation', label: 'Designation', group: 'employment', type: 'text' },
  { tag: 'employment.experience_years', label: 'Years of Experience', group: 'employment', type: 'text' },
  { tag: 'employment.current_salary', label: 'Current Salary', group: 'employment', type: 'text' },

  // ── employment documents (file) ──────────────────────────────────
  { tag: 'employment.offer_letter', label: 'Offer Letter', group: 'employment', type: 'file' },
  { tag: 'employment.appointment_letter', label: 'Appointment Letter', group: 'employment', type: 'file' },
  { tag: 'employment.experience_letter', label: 'Experience Letter', group: 'employment', type: 'file', multi: true },
  { tag: 'employment.payslip', label: 'Payslip', group: 'employment', type: 'file', multi: true },
  { tag: 'employment.form16', label: 'Form 16', group: 'employment', type: 'file' },

  // ── financial (text) ─────────────────────────────────────────────
  { tag: 'financial.bank_name', label: 'Bank Name', group: 'financial', type: 'text' },
  { tag: 'financial.account_number', label: 'Account Number', group: 'financial', type: 'text',
    validation: '^[0-9]{9,18}$' },
  { tag: 'financial.ifsc', label: 'IFSC Code', group: 'financial', type: 'text',
    validation: '^[A-Z]{4}0[A-Z0-9]{6}$' },
  { tag: 'financial.upi_id', label: 'UPI ID', group: 'financial', type: 'text' },

  // ── financial documents (file) ───────────────────────────────────
  { tag: 'financial.bank_statement', label: 'Bank Statement', group: 'financial', type: 'file', multi: true },
  { tag: 'financial.cancelled_cheque', label: 'Cancelled Cheque', group: 'financial', type: 'file' },
  { tag: 'financial.itr', label: 'Income Tax Return', group: 'financial', type: 'file', multi: true },

  // ── certificates / proofs (file) ─────────────────────────────────
  { tag: 'certificate.caste', label: 'Caste Certificate', group: 'certificate', type: 'file' },
  { tag: 'certificate.income', label: 'Income Certificate', group: 'certificate', type: 'file' },
  { tag: 'certificate.domicile', label: 'Domicile Certificate', group: 'certificate', type: 'file' },
  { tag: 'certificate.ews', label: 'EWS Certificate', group: 'certificate', type: 'file' },

  // ── medical (text + file) ────────────────────────────────────────
  { tag: 'medical.blood_group', label: 'Blood Group', group: 'medical', type: 'text',
    validation: '^(A|B|AB|O)[+-]$' },
  { tag: 'medical.disability_certificate', label: 'Disability Certificate', group: 'medical', type: 'file' },
  { tag: 'medical.medical_certificate', label: 'Medical Certificate', group: 'medical', type: 'file' },
  { tag: 'medical.vaccination_certificate', label: 'Vaccination Certificate', group: 'medical', type: 'file' },

  // ── photo / signature (file) ─────────────────────────────────────
  { tag: 'photo.passport_size', label: 'Passport-size Photo', group: 'photo', type: 'file' },
  { tag: 'signature.specimen', label: 'Signature Specimen', group: 'signature', type: 'file' },

  // ── derived (computed, never stored) ─────────────────────────────
  { tag: 'derived.age', label: 'Age', group: 'derived', type: 'text', computed: true },
  { tag: 'derived.full_address', label: 'Full Address', group: 'derived', type: 'text', computed: true },
] as const satisfies readonly TagDef[];

export type DocFillTag = (typeof DOCFILL_TAGS)[number]['tag'];

/** Lookup a tag definition by key. */
export const TAG_MAP: Record<string, TagDef> = Object.fromEntries(
  DOCFILL_TAGS.map((t) => [t.tag, t])
);

/** True if the tag is a file tag. Unknown tags default to text. */
export function isFileTag(tag: string): boolean {
  return TAG_MAP[tag]?.type === 'file';
}

/** All distinct groups, in registry order. */
export const TAG_GROUPS: string[] = [...new Set(DOCFILL_TAGS.map((t) => t.group))];
