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
declare const TAG_SCHEMA_VERSION = 2;
interface TagDef {
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
declare const DOCFILL_TAGS: readonly [{
    readonly tag: "identity.full_name";
    readonly label: "Full Name";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.father_name";
    readonly label: "Father's Name";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.mother_name";
    readonly label: "Mother's Name";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.spouse_name";
    readonly label: "Spouse's Name";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.dob";
    readonly label: "Date of Birth";
    readonly group: "identity";
    readonly type: "text";
    readonly validation: "^\\d{4}-\\d{2}-\\d{2}$";
}, {
    readonly tag: "identity.gender";
    readonly label: "Gender";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.nationality";
    readonly label: "Nationality";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.marital_status";
    readonly label: "Marital Status";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.religion";
    readonly label: "Religion";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.category";
    readonly label: "Category (GEN/OBC/SC/ST/EWS)";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.pan";
    readonly label: "PAN";
    readonly group: "identity";
    readonly type: "text";
    readonly validation: "^[A-Z]{5}[0-9]{4}[A-Z]$";
}, {
    readonly tag: "identity.aadhaar";
    readonly label: "Aadhaar Number";
    readonly group: "identity";
    readonly type: "text";
    readonly validation: "^[0-9]{12}$";
}, {
    readonly tag: "identity.passport_number";
    readonly label: "Passport Number";
    readonly group: "identity";
    readonly type: "text";
    readonly validation: "^[A-Z][0-9]{7}$";
}, {
    readonly tag: "identity.voter_id";
    readonly label: "Voter ID Number";
    readonly group: "identity";
    readonly type: "text";
    readonly validation: "^[A-Z]{3}[0-9]{7}$";
}, {
    readonly tag: "identity.driving_license_number";
    readonly label: "Driving License Number";
    readonly group: "identity";
    readonly type: "text";
}, {
    readonly tag: "identity.aadhaar_card";
    readonly label: "Aadhaar Card";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "identity.pan_card";
    readonly label: "PAN Card";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "identity.passport";
    readonly label: "Passport";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "identity.voter_id_card";
    readonly label: "Voter ID Card";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "identity.driving_license";
    readonly label: "Driving License";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "identity.ration_card";
    readonly label: "Ration Card";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "identity.birth_certificate";
    readonly label: "Birth Certificate";
    readonly group: "identity";
    readonly type: "file";
}, {
    readonly tag: "contact.email";
    readonly label: "Email";
    readonly group: "contact";
    readonly type: "text";
    readonly validation: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
}, {
    readonly tag: "contact.phone";
    readonly label: "Phone";
    readonly group: "contact";
    readonly type: "text";
    readonly validation: "^[6-9][0-9]{9}$";
}, {
    readonly tag: "contact.alt_phone";
    readonly label: "Alternate Phone";
    readonly group: "contact";
    readonly type: "text";
    readonly validation: "^[6-9][0-9]{9}$";
}, {
    readonly tag: "address.current";
    readonly label: "Current Address";
    readonly group: "address";
    readonly type: "text";
}, {
    readonly tag: "address.permanent";
    readonly label: "Permanent Address";
    readonly group: "address";
    readonly type: "text";
}, {
    readonly tag: "address.city";
    readonly label: "City";
    readonly group: "address";
    readonly type: "text";
}, {
    readonly tag: "address.state";
    readonly label: "State";
    readonly group: "address";
    readonly type: "text";
}, {
    readonly tag: "address.country";
    readonly label: "Country";
    readonly group: "address";
    readonly type: "text";
}, {
    readonly tag: "address.pincode";
    readonly label: "PIN Code";
    readonly group: "address";
    readonly type: "text";
    readonly validation: "^[1-9][0-9]{5}$";
}, {
    readonly tag: "address.proof";
    readonly label: "Address Proof";
    readonly group: "address";
    readonly type: "file";
}, {
    readonly tag: "education.10th_percentage";
    readonly label: "10th Percentage";
    readonly group: "education";
    readonly type: "text";
}, {
    readonly tag: "education.12th_percentage";
    readonly label: "12th Percentage";
    readonly group: "education";
    readonly type: "text";
}, {
    readonly tag: "education.degree";
    readonly label: "Degree";
    readonly group: "education";
    readonly type: "text";
}, {
    readonly tag: "education.degree_cgpa";
    readonly label: "Degree CGPA";
    readonly group: "education";
    readonly type: "text";
}, {
    readonly tag: "education.university";
    readonly label: "University / Board";
    readonly group: "education";
    readonly type: "text";
}, {
    readonly tag: "education.graduation_year";
    readonly label: "Graduation Year";
    readonly group: "education";
    readonly type: "text";
    readonly validation: "^(19|20)[0-9]{2}$";
}, {
    readonly tag: "education.10th_marksheet";
    readonly label: "10th Marksheet";
    readonly group: "education";
    readonly type: "file";
}, {
    readonly tag: "education.12th_marksheet";
    readonly label: "12th Marksheet";
    readonly group: "education";
    readonly type: "file";
}, {
    readonly tag: "education.degree_certificate";
    readonly label: "Degree Certificate";
    readonly group: "education";
    readonly type: "file";
}, {
    readonly tag: "education.degree_marksheet";
    readonly label: "Degree Marksheet";
    readonly group: "education";
    readonly type: "file";
    readonly multi: true;
}, {
    readonly tag: "education.transfer_certificate";
    readonly label: "Transfer Certificate";
    readonly group: "education";
    readonly type: "file";
}, {
    readonly tag: "education.migration_certificate";
    readonly label: "Migration Certificate";
    readonly group: "education";
    readonly type: "file";
}, {
    readonly tag: "employment.employer";
    readonly label: "Employer";
    readonly group: "employment";
    readonly type: "text";
}, {
    readonly tag: "employment.designation";
    readonly label: "Designation";
    readonly group: "employment";
    readonly type: "text";
}, {
    readonly tag: "employment.experience_years";
    readonly label: "Years of Experience";
    readonly group: "employment";
    readonly type: "text";
}, {
    readonly tag: "employment.current_salary";
    readonly label: "Current Salary";
    readonly group: "employment";
    readonly type: "text";
}, {
    readonly tag: "employment.offer_letter";
    readonly label: "Offer Letter";
    readonly group: "employment";
    readonly type: "file";
}, {
    readonly tag: "employment.appointment_letter";
    readonly label: "Appointment Letter";
    readonly group: "employment";
    readonly type: "file";
}, {
    readonly tag: "employment.experience_letter";
    readonly label: "Experience Letter";
    readonly group: "employment";
    readonly type: "file";
    readonly multi: true;
}, {
    readonly tag: "employment.payslip";
    readonly label: "Payslip";
    readonly group: "employment";
    readonly type: "file";
    readonly multi: true;
}, {
    readonly tag: "employment.form16";
    readonly label: "Form 16";
    readonly group: "employment";
    readonly type: "file";
}, {
    readonly tag: "financial.bank_name";
    readonly label: "Bank Name";
    readonly group: "financial";
    readonly type: "text";
}, {
    readonly tag: "financial.account_number";
    readonly label: "Account Number";
    readonly group: "financial";
    readonly type: "text";
    readonly validation: "^[0-9]{9,18}$";
}, {
    readonly tag: "financial.ifsc";
    readonly label: "IFSC Code";
    readonly group: "financial";
    readonly type: "text";
    readonly validation: "^[A-Z]{4}0[A-Z0-9]{6}$";
}, {
    readonly tag: "financial.upi_id";
    readonly label: "UPI ID";
    readonly group: "financial";
    readonly type: "text";
}, {
    readonly tag: "financial.bank_statement";
    readonly label: "Bank Statement";
    readonly group: "financial";
    readonly type: "file";
    readonly multi: true;
}, {
    readonly tag: "financial.cancelled_cheque";
    readonly label: "Cancelled Cheque";
    readonly group: "financial";
    readonly type: "file";
}, {
    readonly tag: "financial.itr";
    readonly label: "Income Tax Return";
    readonly group: "financial";
    readonly type: "file";
    readonly multi: true;
}, {
    readonly tag: "certificate.caste";
    readonly label: "Caste Certificate";
    readonly group: "certificate";
    readonly type: "file";
}, {
    readonly tag: "certificate.income";
    readonly label: "Income Certificate";
    readonly group: "certificate";
    readonly type: "file";
}, {
    readonly tag: "certificate.domicile";
    readonly label: "Domicile Certificate";
    readonly group: "certificate";
    readonly type: "file";
}, {
    readonly tag: "certificate.ews";
    readonly label: "EWS Certificate";
    readonly group: "certificate";
    readonly type: "file";
}, {
    readonly tag: "medical.blood_group";
    readonly label: "Blood Group";
    readonly group: "medical";
    readonly type: "text";
    readonly validation: "^(A|B|AB|O)[+-]$";
}, {
    readonly tag: "medical.disability_certificate";
    readonly label: "Disability Certificate";
    readonly group: "medical";
    readonly type: "file";
}, {
    readonly tag: "medical.medical_certificate";
    readonly label: "Medical Certificate";
    readonly group: "medical";
    readonly type: "file";
}, {
    readonly tag: "medical.vaccination_certificate";
    readonly label: "Vaccination Certificate";
    readonly group: "medical";
    readonly type: "file";
}, {
    readonly tag: "photo.passport_size";
    readonly label: "Passport-size Photo";
    readonly group: "photo";
    readonly type: "file";
}, {
    readonly tag: "signature.specimen";
    readonly label: "Signature Specimen";
    readonly group: "signature";
    readonly type: "file";
}, {
    readonly tag: "derived.age";
    readonly label: "Age";
    readonly group: "derived";
    readonly type: "text";
    readonly computed: true;
}, {
    readonly tag: "derived.full_address";
    readonly label: "Full Address";
    readonly group: "derived";
    readonly type: "text";
    readonly computed: true;
}];
type DocFillTag = (typeof DOCFILL_TAGS)[number]['tag'];
/** Lookup a tag definition by key. */
declare const TAG_MAP: Record<string, TagDef>;
/** True if the tag is a file tag. Unknown tags default to text. */
declare function isFileTag(tag: string): boolean;
/** All distinct groups, in registry order. */
declare const TAG_GROUPS: string[];

/** Minimal logger contract. Consumers can pass their own; default is silent. */
interface Logger {
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}

/**
 * Shared types for the DocFill SDK.
 * The tag vocabulary and payload shapes here MUST stay in sync with docfill-pwa
 * and docfill-demo-form (see the shared build spec, §4 and §5).
 */
/** Canonical, dot-namespaced tag vocabulary — see the registry in `tags.ts`. */

/** Text/value tags come back with a `value`. */
interface TextFieldPayload {
    value: string | number;
}
/** File tags come back with a Drive reference (never raw bytes). */
interface FileFieldPayload {
    fileName: string;
    driveFileId?: string;
    driveUrl?: string;
    /** Optional direct URL, present when the PWA proxies the file. */
    fileUrl?: string;
}
type FieldPayload = TextFieldPayload | FileFieldPayload;
/** Keyed by tag. Mirrors the PWA's `filled_payload` column. */
type FilledPayload = Record<string, FieldPayload>;
type SessionStatus = 'pending' | 'filled' | 'expired';
/** A row from the shared `sessions` table (only the columns the SDK reads). */
interface SessionRow {
    id: string;
    form_id: string;
    required_tags: string[];
    status: SessionStatus;
    filled_payload: FilledPayload | null;
    created_at: string;
    expires_at: string;
}
interface DocFillOptions {
    /** Any string identifying this form, e.g. 'college-admission-form-v1'. */
    formId: string;
    /** Supabase project URL. Defaults to the shared DocFill backend. */
    supabaseUrl?: string;
    /** Supabase publishable/anon key. Defaults to the shared DocFill backend. */
    supabaseAnonKey?: string;
    /** Base URL of the DocFill PWA; used to build the QR target URL. Defaults to the platform PWA. */
    pwaUrl?: string;
    /**
     * Origin stamped on the session for the audit log ("which website").
     * Defaults to `window.location.origin`. Pass a value to override, or `''` to disable.
     */
    origin?: string;
    /**
     * Root element to scan for `data-docfill` fields. Defaults to `document`.
     * Useful when the form lives inside a specific container or shadow host.
     */
    scanRoot?: Document | HTMLElement;
    /** QR pixel size (width & height). Default 220. */
    qrSize?: number;
    /** Polling interval in ms. Default 1500. */
    pollIntervalMs?: number;
    /** Give up polling after this many consecutive errors. Default 5. */
    maxPollErrors?: number;
    /** Subscribe to the Realtime Broadcast accelerator alongside polling. Default true. */
    realtime?: boolean;
    /** Per-file fetch timeout in ms when injecting real files. Default 15000. */
    fetchTimeoutMs?: number;
    /** Enable built-in console logging. Default false. */
    debug?: boolean;
    /** Provide a custom logger (overrides `debug`). */
    logger?: Logger;
}
type DocFillEvent = 'filled' | 'error' | 'session';
/** Payload passed to the `filled` event handler. */
interface FilledEvent {
    sessionId: string;
    payload: FilledPayload;
}

/**
 * Value/file injection into matched DOM elements.
 *
 * Text tags: set `.value` and fire input/change so controlled frameworks react.
 *
 * File tags: browsers forbid setting `<input type="file">.value` to a path, but
 * they DO allow assigning `input.files` from a `DataTransfer` built from a File
 * we construct in JS. So if we can fetch the file bytes (needs a CORS-accessible
 * `fileUrl`/`driveUrl`), we inject a real File into the native input — the host
 * form submits it like a normal upload, no backend change. If the bytes aren't
 * fetchable, we fall back to a reference chip + `getAttachedFile()`.
 */

interface AttachedFile {
    fileName: string;
    driveFileId?: string;
    driveUrl?: string;
    fileUrl?: string;
    /** True when real file bytes were injected into a native file input. */
    injected?: boolean;
}

interface WidgetOptions extends DocFillOptions {
    /** Where to place the trigger button (selector/element). Omit for a floating button. */
    target?: string | HTMLElement;
    /** Button label. Default "⚡ Autofill with DocFill". */
    buttonText?: string;
    /** Modal heading. Default "Scan with the DocFill app". */
    modalTitle?: string;
    /** Modal subtitle. */
    modalHint?: string;
    /** Auto-close the modal after a successful fill. Default true. */
    autoClose?: boolean;
}
interface WidgetHandle {
    open(): void;
    close(): void;
    destroy(): void;
}
declare function mountWidget(options: WidgetOptions): WidgetHandle;
/**
 * UMD convenience: if the SDK <script> tag carries `data-docfill-form`, create a
 * floating widget automatically — zero JS for the developer.
 *   <script src="…docfill.global.js" data-docfill-form="my-form"></script>
 */
declare function autoInitFromScript(): void;

/** Typed error surface for the DocFill SDK. */
type DocFillErrorCode = 'MISSING_OPTION' | 'MOUNT_TARGET_NOT_FOUND' | 'NO_FIELDS' | 'SESSION_CREATE_FAILED' | 'SESSION_READ_FAILED' | 'SESSION_EXPIRED' | 'POLL_ABANDONED' | 'DESTROYED';
declare class DocFillError extends Error {
    readonly code: DocFillErrorCode;
    readonly detail?: unknown;
    constructor(code: DocFillErrorCode, message: string, detail?: unknown);
}

type Handler = (payload: unknown) => void;
declare class DocFill {
    private readonly options;
    private readonly listeners;
    private readonly attachedFiles;
    private readonly log;
    private readonly abort;
    private sessions;
    private fields;
    private session;
    private token;
    private destroyed;
    constructor(options: DocFillOptions);
    /**
     * Scan the DOM for tagged fields, create a session, render the QR into
     * `target`, and start listening for the fill.
     * @param target CSS selector or element to render the QR into.
     */
    mount(target: string | HTMLElement): Promise<void>;
    private handleFilled;
    /** Subscribe to an event. Returns an unsubscribe function. */
    on(event: DocFillEvent, handler: Handler): () => void;
    private emit;
    /**
     * Return the Drive reference for an attached file tag, or null.
     * File inputs can't be set programmatically (browser security), so the
     * consuming site's submit handler decides what to do with this reference.
     */
    getAttachedFile(tag: string): AttachedFile | null;
    /** The current session id, if mounted. */
    get sessionId(): string | null;
    /** Stop listening and clean up subscriptions/timers. */
    destroy(): void;
    /**
     * Drop-in widget: renders an "Autofill with DocFill" button + QR modal.
     * `DocFill.widget({ formId: 'my-form' })` — no custom UI code needed.
     */
    static widget(options: WidgetOptions): WidgetHandle;
}

export { type AttachedFile, DOCFILL_TAGS, DocFill, DocFillError, type DocFillErrorCode, type DocFillEvent, type DocFillOptions, type DocFillTag, type FieldPayload, type FileFieldPayload, type FilledEvent, type FilledPayload, type Logger, type SessionRow, type SessionStatus, TAG_GROUPS, TAG_MAP, TAG_SCHEMA_VERSION, type TagDef, type TextFieldPayload, type WidgetHandle, type WidgetOptions, autoInitFromScript, DocFill as default, isFileTag, mountWidget };
