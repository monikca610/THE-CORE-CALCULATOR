export interface SubjectInfo {
  code: string;
  name: string;
  slot: string; // e.g., 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'LAB'
  credits: string; // e.g., '3-1-0-4'
  faculty: string;
  department: string;
  periodsPerWeek: number;
  color: string;
}

export interface PeriodSlot {
  period: number;
  time: string;
  subjectCode: string; // empty string or 'LUNCH' or 'BREAK'
  room?: string;
  note?: string;
}

export type DaySchedule = PeriodSlot[];

export interface WeeklySchedule {
  Monday: DaySchedule;
  Tuesday: DaySchedule;
  Wednesday: DaySchedule;
  Thursday: DaySchedule;
  Friday: DaySchedule;
}

export interface ClassSection {
  id: string;
  name: string;
  program: string;
  batchYear: string;
  semester: string;
  semesterNumber: number;
  academicCycle: string;
  venue: string;
  department: string;
  institution: string;
  subjects: SubjectInfo[];
  schedule: WeeklySchedule;
}

export const PERIOD_TIMINGS_DEFAULT = [
  { period: 1, time: '09:00 - 09:50' },
  { period: 2, time: '09:50 - 10:40' },
  { period: 3, time: '10:50 - 11:40' },
  { period: 4, time: '11:40 - 12:30' },
  { period: 5, time: '12:30 - 01:20' }, // Lunch
  { period: 6, time: '01:20 - 02:10' },
  { period: 7, time: '02:10 - 03:00' },
  { period: 8, time: '03:10 - 04:00' },
  { period: 9, time: '04:00 - 04:50' },
];

export const PERIOD_TIMINGS_YEAR_1 = [
  { period: 1, time: '09:00 - 09:50' },
  { period: 2, time: '09:55 - 10:45' },
  { period: 3, time: '10:50 - 11:40' },
  { period: 4, time: '11:45 - 12:35' },
  { period: 5, time: '12:35 - 01:30' }, // Lunch
  { period: 6, time: '01:30 - 02:20' },
  { period: 7, time: '02:25 - 03:15' },
  { period: 8, time: '03:20 - 04:10' },
  { period: 9, time: '04:15 - 05:05' },
];

// Color palette mapping for subject slots to ensure consistent neon/cyber styling
export const SLOT_COLORS: Record<string, string> = {
  A: '#50E3FF', // Neon Cyan
  B: '#B7FF5A', // Electric Lime
  C: '#FFB84D', // Amber
  D: '#A78BFA', // Purple/Violet
  E: '#F472B6', // Pink
  F: '#38BDF8', // Sky Blue
  G: '#34D399', // Emerald
  H: '#FBBF24', // Yellow
  I: '#FB7185', // Rose
  LAB: '#2DD4BF', // Teal
};

export const CLASS_SECTIONS: ClassSection[] = [
  // 1. II - BME (3rd Sem)
  {
    id: 'ii-bme',
    name: 'II - BME',
    program: 'Biomedical Engineering',
    batchYear: 'II - Year BME',
    semester: 'III Semester (Odd)',
    semesterNumber: 3,
    academicCycle: '2026-2027',
    venue: 'IST 602 / FN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. A. Manickam', department: 'ASP/MAT', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21BMC202T', name: 'Biomedical Signals and Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Senthil Kumaran V N', department: 'ASP & HOD / ECE', periodsPerWeek: 3, color: SLOT_COLORS.B },
      { code: '21BMC203J', name: 'Electric and Electronic Circuits', slot: 'C', credits: '3-0-2-4', faculty: 'Dr. Prabin Kumar Bera', department: 'AP/ECE', periodsPerWeek: 4, color: SLOT_COLORS.C },
      { code: '21BMC204J', name: 'Digital Logic for Medical Systems', slot: 'D', credits: '2-0-2-3', faculty: 'Dr. G. Gifta', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21PYS202T', name: 'Medical Physics', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. D. Rajeswari', department: 'ASP/PHY', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. H. Sribhuvaneshwari', department: 'AP/ECE', periodsPerWeek: 1, color: SLOT_COLORS.F },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. N. Suganthi', department: 'RS - ECE', periodsPerWeek: 2, color: SLOT_COLORS.G },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC-TB-106', department: 'CDC', periodsPerWeek: 2, color: SLOT_COLORS.H },
      { code: '21PDH201T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. Francis Arockiya Mary', department: 'RS - EEE', periodsPerWeek: 2, color: SLOT_COLORS.I },
      { code: 'DLMS/EEC', name: 'DLMS / EEC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Lab Faculty Team', department: 'EEC-107,309', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21PYS202T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21BMC203J' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21PDH201T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21PDH201T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: 'DLMS/EEC', room: '107,309' },
        { period: 7, time: '02:10 - 03:00', subjectCode: 'DLMS/EEC', room: '107,309' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21BMC203J' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21PYS202T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21BMC202T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21MAB201T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21PDM201L', room: 'TB-106' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21BMC202T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21BMC204J' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21MAB201T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21LEM202T', room: 'G-602' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21MAB201T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21PYS202T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21BMC202T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21BMC204J' },
        { period: 8, time: '03:10 - 04:00', subjectCode: 'DLMS/EEC', room: '107,309' },
        { period: 9, time: '04:00 - 04:50', subjectCode: 'DLMS/EEC', room: '107,309' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21LEM201T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21MAB201T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21BMC203J' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21BMC204J' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21LEM202T', room: 'G-602' }
      ]
    }
  },

  // 2. II - ECE-DS A (3rd Sem)
  {
    id: 'ii-ece-ds-a',
    name: 'II - ECE-DS A',
    program: 'Electronics & Communication (Data Science)',
    batchYear: 'II - Year DS-A',
    semester: 'III Semester (Odd)',
    semesterNumber: 3,
    academicCycle: '2026-2027',
    venue: 'IST 416 / FN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. C. Arun Kumar', department: 'AP/Maths', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21ECC201T', name: 'Solid State Devices', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Jeevanantham S', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.B },
      { code: '21CSS201T', name: 'Computer Organization and Architecture', slot: 'C', credits: '3-1-0-4', faculty: 'Dr. P. Murugapandiyan', department: 'Prof./ECE', periodsPerWeek: 4, color: SLOT_COLORS.C },
      { code: '21ECC203T', name: 'Digital Logic Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. S. Krishnakumar', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. V. Bharathi', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. Jothi M', department: 'AP/ECE', periodsPerWeek: 1, color: SLOT_COLORS.F },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. N. Suganthi', department: 'RS - ECE', periodsPerWeek: 2, color: SLOT_COLORS.G },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC-TB-106', department: 'CDC', periodsPerWeek: 2, color: SLOT_COLORS.H },
      { code: '21PDH209T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. D. Lavanya', department: 'RS - ECE', periodsPerWeek: 2, color: SLOT_COLORS.I },
      { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. Jeevanantham S / Dr. V. Bharathi', department: 'AP/ECE-DS', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC205T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21MAB201T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21PDH209T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21PDH209T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21LEM202T', room: 'G-602' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECC211L', room: 'LAB-309/107' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECC211L', room: 'LAB-309/107' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21CSS201T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21MAB201T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC205T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC203T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21LEM202T', room: 'G-602' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21PDM201L', room: 'TB-106' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21MAB201T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC201T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CSS201T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC203T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21PDM201L', room: 'TB-106' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC201T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21CSS201T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21MAB201T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21LEM201T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECC211L', room: 'LAB-309/107' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC211L', room: 'LAB-309/107' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC203T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC201T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC205T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21CSS201T' }
      ]
    }
  },

  // 3. II - ECE-DS B (3rd Sem)
  {
    id: 'ii-ece-ds-b',
    name: 'II - ECE-DS B',
    program: 'Electronics & Communication (Data Science)',
    batchYear: 'II - Year DS-B',
    semester: 'III Semester (Odd)',
    semesterNumber: 3,
    academicCycle: '2026-2027',
    venue: 'IST 411 / AN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB201T', name: 'Transforms and Boundary Value Problems', slot: 'A', credits: '3-1-0-4', faculty: 'NEW FACULTY 3', department: 'AP/MAT', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21ECC201T', name: 'Solid State Devices', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. Jeevanantham S', department: 'AP/ECE DS', periodsPerWeek: 3, color: SLOT_COLORS.B },
      { code: '21CSS201T', name: 'Computer Organization and Architecture', slot: 'C', credits: '3-1-0-4', faculty: 'Dr. P. Murugapandiyan', department: 'Prof./ECE', periodsPerWeek: 4, color: SLOT_COLORS.C },
      { code: '21ECC203T', name: 'Digital Logic Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. S. Krishnakumar', department: 'AP/ECE DS', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21ECC205T', name: 'Electromagnetic Theory and Interference', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. V. Bharathi', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21LEM201T', name: 'Professional Ethics', slot: 'F', credits: '1-0-0-0', faculty: 'Dr. K. Vigneshwaran', department: 'AP/ECE', periodsPerWeek: 1, color: SLOT_COLORS.F },
      { code: '21LEM202T', name: 'Universal Human Values-II', slot: 'G', credits: '2-1-0-3', faculty: 'Mrs. D. Lavanya', department: 'RS - ECE', periodsPerWeek: 2, color: SLOT_COLORS.G },
      { code: '21PDM201L', name: 'Verbal Reasoning', slot: 'H', credits: '0-0-2-0', faculty: 'CDC-TB-106', department: 'CDC', periodsPerWeek: 2, color: SLOT_COLORS.H },
      { code: '21PDH209T', name: 'Social Engineering', slot: 'I', credits: '2-0-0-2', faculty: 'Mrs. D. Lavanya', department: 'RS - ECE', periodsPerWeek: 2, color: SLOT_COLORS.I },
      { code: '21ECC211L', name: 'Devices and Digital IC Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. S. Krishnakumar', department: 'AP/ECE DS', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC211L', room: 'LAB-309/107' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC211L', room: 'LAB-309/107' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECC203T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC201T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21CSS201T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21PDH209T' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC211L', room: 'LAB-309/107' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC211L', room: 'LAB-309/107' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21CSS201T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC203T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECC205T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21MAB201T' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21LEM202T', room: 'G-401' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21LEM202T', room: 'G-401' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDH209T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC205T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21MAB201T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECC203T' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21LEM202T', room: 'G-401' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21MAB201T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21CSS201T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECC201T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECC205T' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21PDM201L', room: 'TB-106' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21LEM201T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21MAB201T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECC201T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21CSS201T' }
      ]
    }
  },

  // 4. III ECE-A (5th Sem)
  {
    id: 'iii-ece-a',
    name: 'III - ECE-A',
    program: 'Electronics & Communication Engineering',
    batchYear: 'III - Year ECE A Section',
    semester: 'V Semester (Odd)',
    semesterNumber: 5,
    academicCycle: '2026-2027',
    venue: 'IST 518 / FN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 3', department: 'AP/Maths', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Dr. M. Manikandan', department: 'AP/ECE', periodsPerWeek: 4, color: SLOT_COLORS.B },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. M. Jothi', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.C },
      { code: '21ECE468T', name: 'System and Network on Chip', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. V. Manikandan', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. J. Jencia', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21GNP301L', name: 'Community Connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. V. Rajesh / Dr. V. Bharathi', department: 'AP/ECE', periodsPerWeek: 2, color: SLOT_COLORS.F },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC / 625', department: 'CDC', periodsPerWeek: 4, color: SLOT_COLORS.G },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. K. Vigneshwaran', department: 'AP/ECE', periodsPerWeek: 1, color: SLOT_COLORS.H },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. M. Jothi & Dr. P. Murugapandiyan / Dr. V. Manikandan', department: 'AP/ECE', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21CSO355T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC301P' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC301P' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21MAB302T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21PDM301L', room: 'G-625' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21LEM301T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECE468T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC301P' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC301P', note: 'B-Proj' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21PDM301L', room: 'G-625' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC303T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21MAB302T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE468T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21GNP301L' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECC311L', room: 'LAB-108/309' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECC311L', room: 'LAB-108/309' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21MAB302T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21CSO355T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC303T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21GNP301L' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECE468T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21MAB302T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CSO355T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC303T' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECC311L', room: 'LAB-108/309' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC311L', room: 'LAB-108/309' }
      ]
    }
  },

  // 5. III ECE-B (5th Sem)
  {
    id: 'iii-ece-b',
    name: 'III - ECE-B',
    program: 'Electronics & Communication Engineering',
    batchYear: 'III - Year ECE B Section',
    semester: 'V Semester (Odd)',
    semesterNumber: 5,
    academicCycle: '2026-2027',
    venue: 'IST 518 / AN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. M. Thanga Rejini', department: 'AP/Maths', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Mrs. B. Abirami', department: 'EO/SRMIST', periodsPerWeek: 4, color: SLOT_COLORS.B },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. R. Vinoth Raj', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.C },
      { code: '21ECE468T', name: 'System and Network on Chip', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. V. Manikandan', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. J. Jencia', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21GNP301L', name: 'Community Connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. H. Sudharsan / Ms. T. Swetha', department: 'AP/ECE', periodsPerWeek: 2, color: SLOT_COLORS.F },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC-625', department: 'CDC', periodsPerWeek: 4, color: SLOT_COLORS.G },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. A. Anand', department: 'AP/ECE', periodsPerWeek: 1, color: SLOT_COLORS.H },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. Sreenivasa Ijada Rao / Dr. B. DeviSri', department: 'Prof. / ECE', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC311L', room: 'LAB-108/309' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC311L', room: 'LAB-108/309' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21CSO355T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC301P' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21MAB302T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECE468T' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21GNP301L' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC301P' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECE468T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECC303T' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECC301P', note: 'B-Proj' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC301P' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21MAB302T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21LEM301T' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC311L', room: 'LAB-108/309' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC311L', room: 'LAB-108/309' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21MAB302T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC303T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21CSO355T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21GNP301L' }
      ],
      Friday: [
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECC303T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21MAB302T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21CSO355T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECE468T' }
      ]
    }
  },

  // 6. III ECE-DS (5th Sem)
  {
    id: 'iii-ece-ds',
    name: 'III - ECE-DS',
    program: 'Electronics & Communication (Data Science)',
    batchYear: 'III - Year ECE_DS',
    semester: 'V Semester (Odd)',
    semesterNumber: 5,
    academicCycle: '2026-2027',
    venue: 'IST 519 / FN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB302T', name: 'Discrete Mathematics', slot: 'A', credits: '3-1-0-4', faculty: 'New Faculty 2', department: 'AP/Maths', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21ECC301P', name: 'Microprocessor, Microcontroller, & Interfacing', slot: 'B', credits: '3-1-0-4', faculty: 'Mrs. B. Abirami', department: 'EO/SRMIST', periodsPerWeek: 4, color: SLOT_COLORS.B },
      { code: '21ECC303T', name: 'VLSI Design and Technology', slot: 'C', credits: '3-0-0-3', faculty: 'Dr. R. Vinoth Raj', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.C },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. Dr. Chitra Devi', department: 'ASP/SoC', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21ECE371T', name: 'Database Design and Management', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. S. Saraswathi', department: 'AP/SoC', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21GNP301L', name: 'Community Connect', slot: 'F', credits: '0-0-2-1', faculty: 'Dr. S. Jeevanantham / Dr. V. Manikandan', department: 'AP/ECE-DS', periodsPerWeek: 2, color: SLOT_COLORS.F },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC-625', department: 'CDC', periodsPerWeek: 3, color: SLOT_COLORS.G },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. Prabin Kumar Bera', department: 'AP/ECE', periodsPerWeek: 1, color: SLOT_COLORS.H },
      { code: '21ECC311L', name: 'VLSI Design / Microprocessor Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Dr. R. Vinothraj / Dr. H. Sri Bhuvaneshwari', department: 'AP/ECE DS', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECE371T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC301P' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC303T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21MAB302T' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC303T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC301P' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CSO355T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21GNP301L' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECC311L', room: 'LAB-108/107' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21ECC311L', room: 'LAB-108/107' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21LEM301T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC301P' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21MAB302T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC303T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21PDM301L', room: 'G-625' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21MAB302T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21CSO355T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE371T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21GNP301L' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21CSO355T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21MAB302T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE371T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC301P', note: 'B-Proj' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECC311L', room: 'LAB-108/107' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECC311L', room: 'LAB-108/107' }
      ]
    }
  },

  // 7. III - BME (5th Sem)
  {
    id: 'iii-bme',
    name: 'III - BME',
    program: 'Biomedical Engineering',
    batchYear: 'III - Year BME',
    semester: 'V Semester (Odd)',
    semesterNumber: 5,
    academicCycle: '2026-2027',
    venue: 'IST 211 / AN',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21MAB301T', name: 'Probability and Statistics', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. K. M. Karuppusamy', department: 'AP/Maths', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21BMC302J', name: 'Microcontrollers & Its Application in Medicine', slot: 'B', credits: '3-0-2-4', faculty: 'Dr. K. Vigneshwaran', department: 'ASP/ECE', periodsPerWeek: 4, color: SLOT_COLORS.B },
      { code: '21BMC301J', name: 'Biomedical Signal Processing', slot: 'C', credits: '3-0-2-4', faculty: 'Dr. V. N. Senthilkumaran', department: 'HOD / ECE', periodsPerWeek: 4, color: SLOT_COLORS.C },
      { code: '21BME266T', name: 'Biometrics', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. G. Gifta', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21ECO103T', name: 'Modern Wireless Communication System', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Vaishnavi', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21BMC303T', name: 'Principles of Medical Imaging', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasana venkatesh', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.F },
      { code: '21PDM301L', name: 'Analytical and Logical Thinking Skills', slot: 'G', credits: '0-0-2-0', faculty: 'CDC-625', department: 'CDC', periodsPerWeek: 4, color: SLOT_COLORS.G },
      { code: '21LEM301T', name: 'Indian Art Form', slot: 'H', credits: '1-0-0-0', faculty: 'Dr. G. Gifta', department: 'AP/BME', periodsPerWeek: 1, color: SLOT_COLORS.H },
      { code: '21GNP301L', name: 'Community Connect', slot: 'I', credits: '0-0-2-1', faculty: 'Dr. J. Jencia / Dr. N. Prasanna Venkatesh', department: 'AP/BME', periodsPerWeek: 4, color: SLOT_COLORS.I },
      { code: 'MPMC-LAB', name: 'MPMC & Bio DSP Laboratory', slot: 'LAB', credits: '0-0-4-2', faculty: 'Biomedical Lab Staff', department: 'IST 107/108', periodsPerWeek: 4, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 3, time: '10:50 - 11:40', subjectCode: 'MPMC-LAB', room: 'MPMC LAB-107' },
        { period: 4, time: '11:40 - 12:30', subjectCode: 'MPMC-LAB', room: 'MPMC LAB-107' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21ECO103T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21BMC302J' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21BMC303T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21LEM301T' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: 'MPMC-LAB', room: 'BIO DSP LAB-108' },
        { period: 2, time: '09:50 - 10:40', subjectCode: 'MPMC-LAB', room: 'BIO DSP LAB-108' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21PDM301L', room: 'G-625' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21BMC301J' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21BME266T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21MAB301T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21BMC302J' }
      ],
      Wednesday: [
        { period: 6, time: '01:20 - 02:10', subjectCode: '21BMC301J' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21MAB301T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21BMC303T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21BME266T' }
      ],
      Thursday: [
        { period: 3, time: '10:50 - 11:40', subjectCode: '21GNP301L', room: 'I-108' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21GNP301L', room: 'I-108' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21MAB301T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21BMC301J' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21ECO103T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21BMC302J' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21GNP301L', room: 'I-108' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21GNP301L', room: 'I-108' },
        { period: 6, time: '01:20 - 02:10', subjectCode: '21BMC303T' },
        { period: 7, time: '02:10 - 03:00', subjectCode: '21MAB301T' },
        { period: 8, time: '03:10 - 04:00', subjectCode: '21BME266T' },
        { period: 9, time: '04:00 - 04:50', subjectCode: '21ECO103T' }
      ]
    }
  },

  // 8. IV - ECE-A (7th Sem)
  {
    id: 'iv-ece-a',
    name: 'IV - ECE-A',
    program: 'Electronics & Communication Engineering',
    batchYear: 'IV - Year ECE A Section',
    semester: 'VII Semester (Odd)',
    semesterNumber: 7,
    academicCycle: '2026-2027',
    venue: 'IST 225',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21GNH401T', name: 'Behavioural Psychology', slot: 'A', credits: '2-1-0-3', faculty: 'Dr. A. Anand', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.A },
      { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. K. Vigneshwaran', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.B },
      { code: '21ECC402P', name: 'Computer Communication and Network Security', slot: 'C', credits: '2-1-0-3', faculty: 'Dr. S. Jeevanantham', department: 'AP/ECE-DS', periodsPerWeek: 3, color: SLOT_COLORS.C },
      { code: '21ECE461T', name: 'Semiconductor Memory Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. H. SriBhuvaneshwari', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21ECE463T', name: 'Scripting Language for Electronic Design Automation', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Sreenivasa Rao Ijada', department: 'Prof/ECE', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.F },
      { code: '21ECC402P-LAB', name: 'Computer Communication and Network Security Lab', slot: 'LAB', credits: '2-1-0-3', faculty: 'Mrs. T. Swetha', department: 'AP/ECE', periodsPerWeek: 2, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC402P' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21GNH401T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECE461T' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC402P' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECE461T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC401T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21CSO355T' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC401T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC402P-LAB', room: 'LAB - IST 108' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE463T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21CSO355T' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21CSO355T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21GNH401T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE463T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC401T' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC402P' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21GNH401T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE461T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECE463T' }
      ]
    }
  },

  // 9. IV - ECE-B (7th Sem)
  {
    id: 'iv-ece-b',
    name: 'IV - ECE-B',
    program: 'Electronics & Communication Engineering',
    batchYear: 'IV - Year ECE B Section',
    semester: 'VII Semester (Odd)',
    semesterNumber: 7,
    academicCycle: '2026-2027',
    venue: 'IST 227',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21GNH401T', name: 'Behavioural Psychology', slot: 'A', credits: '2-1-0-3', faculty: 'Dr. A. Annand', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.A },
      { code: '21ECC401T', name: 'Wireless Communication and Antenna Systems', slot: 'B', credits: '3-0-0-3', faculty: 'Dr. K. Vigneshwaran', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.B },
      { code: '21ECC402P', name: 'Computer Communication and Network Security', slot: 'C', credits: '2-1-0-3', faculty: 'Dr. R. Rajasekar', department: 'HOD / ECE - DS', periodsPerWeek: 3, color: SLOT_COLORS.C },
      { code: '21ECE461T', name: 'Semiconductor Memory Design', slot: 'D', credits: '3-0-0-3', faculty: 'Dr. H. SriBhuvaneshwari', department: 'AP/ECE', periodsPerWeek: 3, color: SLOT_COLORS.D },
      { code: '21ECE463T', name: 'Scripting Language for Electronic Design Automation', slot: 'E', credits: '3-0-0-3', faculty: 'Dr. Sreenivasa Rao Ijada', department: 'Prof/ECE', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21CSO355T', name: 'Machine Learning for All', slot: 'F', credits: '3-0-0-3', faculty: 'Dr. N. Prasanna Venkatesh', department: 'AP/BME', periodsPerWeek: 3, color: SLOT_COLORS.F },
      { code: '21ECC402P-LAB', name: 'Computer Communication and Network Security Lab', slot: 'LAB', credits: '2-1-0-3', faculty: 'Ms. T. Swetha', department: 'AP/ECE', periodsPerWeek: 2, color: SLOT_COLORS.LAB }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC402P' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21GNH401T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECE463T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21CSO355T' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC402P' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECE463T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CSO355T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC401T' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECC402P' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECE461T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21GNH401T' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21ECC401T' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECE461T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECC401T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21ECC402P-LAB', room: 'LAB - IST 108' },
        { period: 4, time: '11:40 - 12:30', subjectCode: '21GNH401T' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21ECE463T' },
        { period: 2, time: '09:50 - 10:40', subjectCode: '21ECE461T' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CSO355T' }
      ]
    }
  },

  // 10. I - ECE-A (1st Sem)
  {
    id: 'i-ece-a',
    name: 'I - ECE-A',
    program: 'Electronics & Communication Engineering',
    batchYear: 'I - Year ECE A',
    semester: 'I Semester (Odd)',
    semesterNumber: 1,
    academicCycle: '2024-2025',
    venue: 'IST 602',
    department: 'School of Electrical and Electronics Engineering',
    institution: 'SRM Institute of Science and Technology - Tiruchirappalli',
    subjects: [
      { code: '21LEH104T', name: 'German', slot: 'GER', credits: '2-1-0-3', faculty: 'Mr. Selva', department: 'German', periodsPerWeek: 3, color: SLOT_COLORS.H },
      { code: '21GNH101J', name: 'Philosophy of Engineering', slot: 'E', credits: '1-0-2-2', faculty: 'Dr. R. Aarthi', department: 'AP/Phy', periodsPerWeek: 3, color: SLOT_COLORS.E },
      { code: '21MAB102T', name: 'Advanced Calculus and Complex Analysis', slot: 'A', credits: '3-1-0-4', faculty: 'Dr. R. Ragul', department: 'AP/Maths', periodsPerWeek: 4, color: SLOT_COLORS.A },
      { code: '21CYB101J', name: 'Chemistry', slot: 'B', credits: '3-1-2-5', faculty: 'Dr. P. Pachamuthu', department: 'AP/Che', periodsPerWeek: 6, color: SLOT_COLORS.B },
      { code: '21BTB102J', name: 'Electronic System and PCB Design', slot: 'C', credits: '2-0-0-2', faculty: 'Dr. U. Shajith Ali', department: 'Asso.Prof/EEE', periodsPerWeek: 2, color: SLOT_COLORS.C },
      { code: '21CSS101J', name: 'Programming for Problem Solving', slot: 'D', credits: '3-0-2-4', faculty: 'Dr. A. Rama Prasath', department: 'Asso.Prof/CA', periodsPerWeek: 5, color: SLOT_COLORS.D },
      { code: '21MES101L', name: 'Basic Civil and Mechanical Workshop', slot: 'WS', credits: '0-0-4-2', faculty: 'Dr. N.S. Balaji / Dr. M. Kumaran', department: 'Asst.Prof/Mech', periodsPerWeek: 4, color: SLOT_COLORS.LAB },
      { code: '21PDM102L', name: 'General Aptitude', slot: 'APT', credits: '0-0-2-0', faculty: 'Mr. Sivanandhan', department: 'CDC', periodsPerWeek: 2, color: SLOT_COLORS.G },
      { code: '21GNM102L', name: 'NSS', slot: 'NSS', credits: '0-0-2-0', faculty: 'Dr. R. Manickam', department: 'Physical Director', periodsPerWeek: 2, color: SLOT_COLORS.I },
      { code: '21BTB103T', name: 'Biology', slot: 'F', credits: '2-0-0-2', faculty: 'Dr. M. Jaya Priya', department: 'AP/Biotech', periodsPerWeek: 2, color: SLOT_COLORS.F }
    ],
    schedule: {
      Monday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21GNH101J', room: 'IST602' },
        { period: 2, time: '09:55 - 10:45', subjectCode: '21GNH101J', room: 'IST602' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CYB101J', room: 'IST602' },
        { period: 4, time: '11:45 - 12:35', subjectCode: '21MAB102T', room: 'IST602' },
        { period: 6, time: '01:30 - 02:20', subjectCode: '21CYB101J', room: 'Che lab' },
        { period: 7, time: '02:25 - 03:15', subjectCode: '21CYB101J', room: 'Che lab' },
        { period: 8, time: '03:20 - 04:10', subjectCode: '21BTB103T', room: 'IST710' },
        { period: 9, time: '04:15 - 05:05', subjectCode: '21PDM102L', room: 'IST710' }
      ],
      Tuesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21BTB102J', room: 'IST602' },
        { period: 2, time: '09:55 - 10:45', subjectCode: '21CYB101J', room: 'IST602' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21MAB102T', room: 'IST602' },
        { period: 4, time: '11:45 - 12:35', subjectCode: '21CSS101J', room: 'IST602' },
        { period: 6, time: '01:30 - 02:20', subjectCode: '21MES101L', room: 'Workshop (IST 20,21)' },
        { period: 7, time: '02:25 - 03:15', subjectCode: '21MES101L', room: 'Workshop (IST 20,21)' },
        { period: 8, time: '03:20 - 04:10', subjectCode: '21MES101L', room: 'Workshop (IST 20,21)' }
      ],
      Wednesday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21CYB101J', room: 'IST602' },
        { period: 2, time: '09:55 - 10:45', subjectCode: '21GNH101J', room: 'IST602' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21CSS101J', room: 'IST602' },
        { period: 6, time: '01:30 - 02:20', subjectCode: '21CSS101J', room: 'PPS LAB (IST 618)' },
        { period: 7, time: '02:25 - 03:15', subjectCode: '21CSS101J', room: 'PPS LAB (IST 618)' },
        { period: 8, time: '03:20 - 04:10', subjectCode: '21BTB102J', room: 'PCB Lab IST 108' }
      ],
      Thursday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21LEH104T', room: 'IST602' },
        { period: 2, time: '09:55 - 10:45', subjectCode: '21LEH104T', room: 'IST602' },
        { period: 4, time: '11:45 - 12:35', subjectCode: '21MAB102T', room: 'IST602' },
        { period: 6, time: '01:30 - 02:20', subjectCode: '21PDM102L', room: 'CDC IST510' },
        { period: 7, time: '02:25 - 03:15', subjectCode: '21PDM102L', room: 'CDC IST510' },
        { period: 8, time: '03:20 - 04:10', subjectCode: '21GNM102L', room: 'NSS IST201' }
      ],
      Friday: [
        { period: 1, time: '09:00 - 09:50', subjectCode: '21CSS101J', room: 'IST602' },
        { period: 2, time: '09:55 - 10:45', subjectCode: '21MAB102T', room: 'IST602' },
        { period: 3, time: '10:50 - 11:40', subjectCode: '21BTB102J', room: 'IST602' },
        { period: 4, time: '11:45 - 12:35', subjectCode: '21CYB101J', room: 'IST602' },
        { period: 6, time: '01:30 - 02:20', subjectCode: '21BTB103T', room: 'IST602' },
        { period: 7, time: '02:25 - 03:15', subjectCode: '21LEH104T', room: 'German IST626' }
      ]
    }
  }
];

// SRM IST Academic Calendar Events (Odd Semester 2026)
export interface AcademicCalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
  isHoliday: boolean;
  type: 'holiday' | 'exam' | 'checkpoint' | 'event';
}

export const ACADEMIC_EVENTS_2026: AcademicCalendarEvent[] = [
  { date: '2026-07-20', title: 'Semester Commencement', isHoliday: false, type: 'event' },
  { date: '2026-08-15', title: 'Independence Day', isHoliday: true, type: 'holiday' },
  { date: '2026-09-04', title: 'Ganesh Chaturthi', isHoliday: true, type: 'holiday' },
  { date: '2026-09-21', title: 'Cycle Test 1 (Internal Assessment)', isHoliday: false, type: 'exam' },
  { date: '2026-10-02', title: 'Gandhi Jayanti', isHoliday: true, type: 'holiday' },
  { date: '2026-10-19', title: 'Ayudha Puja', isHoliday: true, type: 'holiday' },
  { date: '2026-10-20', title: 'Vijaya Dasami', isHoliday: true, type: 'holiday' },
  { date: '2026-10-26', title: 'Cycle Test 2 (Mid-Term Assessment)', isHoliday: false, type: 'exam' },
  { date: '2026-11-08', title: 'Deepavali Holidays', isHoliday: true, type: 'holiday' },
  { date: '2026-11-09', title: 'Deepavali Holidays', isHoliday: true, type: 'holiday' },
  { date: '2026-11-10', title: 'Deepavali Holidays', isHoliday: true, type: 'holiday' },
  { date: '2026-11-20', title: 'Final Attendance Checkpoint (Detention Lock)', isHoliday: false, type: 'checkpoint' },
  { date: '2026-11-28', title: 'Last Day of Instruction / Model Exams', isHoliday: false, type: 'checkpoint' }
];

export const DEFAULT_SEMESTER_CONFIG = {
  startDate: '2026-07-20',
  currentDate: '2026-09-28', // Late Sept 2026
  checkpointDate: '2026-11-20',
  endDate: '2026-11-28',
  defaultTarget: 75,
};
