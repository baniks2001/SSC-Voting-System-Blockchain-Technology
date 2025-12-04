import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, Download, User, GraduationCap, Hash, Key, RefreshCw, CheckSquare, Square, AlertCircle, ChevronDown, Check, Filter, MoreVertical, CheckCircle, XCircle, Upload, Plus, X, BookOpen, UserX, UserCheck } from 'lucide-react';
import { Voter } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { usePoll } from '../../contexts/PollContext';

interface ExportOptions {
  studentId: boolean;
  fullName: boolean;
  course: boolean;
  yearLevel: boolean;
  section: boolean;
  hasVoted: boolean;
  votedAt: boolean;
  createdAt: boolean;
  password: boolean;
  isActive: boolean;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

interface ImportedStudent {
  studentId: string;
  fullName: string;
  course: string;
  yearLevel: number;
  section: string;
  password: string;
  status: 'new' | 'duplicate' | 'error';
  error?: string;
  originalData?: any;
}

export const VoterManagement: React.FC = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCoursesModal, setShowCoursesModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResetVoteModal, setShowResetVoteModal] = useState(false);
  const [showCourseDeleteModal, setShowCourseDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    year: '',
    section: '',
    hasVoted: '',
    isActive: ''
  });
  const [selectedExportCourses, setSelectedExportCourses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentSelection, setShowStudentSelection] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState<number | null>(null);
  const [importedStudents, setImportedStudents] = useState<ImportedStudent[]>([]);
  const [importStep, setImportStep] = useState<'upload' | 'review' | 'complete'>('upload');
  const [importSummary, setImportSummary] = useState({ success: 0, duplicates: 0, errors: 0 });
  const [newCourse, setNewCourse] = useState({ name: '', code: '' });
  const [addingCourse, setAddingCourse] = useState(false);
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null);
  const [resetVoteAction, setResetVoteAction] = useState<'all' | 'selected' | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const { showToast } = useToast();
  const { pollStatus } = usePoll();

  const isVotingActive = pollStatus === 'active';
  const isVotingPaused = pollStatus === 'paused';
  const isVotingFinished = pollStatus === 'finished';

  const canEditAllFields = isVotingFinished;
  const canEditPasswordOnly = isVotingActive || isVotingPaused;

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    studentId: true,
    fullName: true,
    course: true,
    yearLevel: true,
    section: true,
    hasVoted: true,
    votedAt: false,
    createdAt: false,
    password: true,
    isActive: true
  });

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    course: '',
    yearLevel: 1,
    section: '',
    password: '',
    isActive: true
  });

  // Auto-generate password when all required fields are filled in add mode
  useEffect(() => {
    if (!editingVoter && showModal) {
      const { studentId, fullName, course, yearLevel, section } = formData;
      const allFieldsFilled = studentId && fullName && course && yearLevel && section;

      if (allFieldsFilled) {
        const generatedPassword = generatePasswordForStudent(studentId, fullName, yearLevel, section);
        setFormData(prev => ({ ...prev, password: generatedPassword }));
      } else {
        setFormData(prev => ({ ...prev, password: '' }));
      }
    }
  }, [formData.studentId, formData.fullName, formData.course, formData.yearLevel, formData.section, editingVoter, showModal]);

  useEffect(() => {
    fetchVoters();
    fetchCourses();
  }, []);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.course) params.append('course', filters.course);
      if (filters.year) params.append('year', filters.year);
      if (filters.section) params.append('section', filters.section);
      if (filters.hasVoted) params.append('hasVoted', filters.hasVoted);
      if (filters.isActive) params.append('isActive', filters.isActive);

      // First, get the response
      const response = await api.get(`/voters?${params.toString()}`, {
        successMessage: 'Voters loaded successfully'
      });

      // Then process the response
      const votersData = response.data || response;
      const votersArray = Array.isArray(votersData) ? votersData : [];

      // Show custom message if there's a search or filter
      if (searchTerm || Object.values(filters).some(Boolean)) {
        showToast('success', `Found ${votersArray.length} voters`);
      }

      setVoters(votersArray);
    } catch (error: any) {
      showToast('error', 'Failed to fetch voters');
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await api.get('/courses', {
        successMessage: 'Courses loaded successfully'
      });
      setCourses(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const addCourse = async () => {
    if (!newCourse.name.trim() || !newCourse.code.trim()) {
      showToast('warning', 'Please enter both course name and code');
      return;
    }

    try {
      setAddingCourse(true);
      const response = await api.post('/courses', newCourse, {
        successMessage: 'Course added successfully'
      });

      // Handle response - backend should return course object
      const addedCourse = {
        id: response.id || response.insertId,
        name: newCourse.name,
        code: newCourse.code
      };

      setCourses(prev => [...prev, addedCourse]);
      setNewCourse({ name: '', code: '' });
    } catch (error: any) {
      showToast('error', error.message || 'Failed to add course');
    } finally {
      setAddingCourse(false);
    }
  };

  const deleteCourse = async (course: Course) => {
    setCourseToDelete(course);
    setShowCourseDeleteModal(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await api.delete(`/courses/${courseToDelete.id}`, {
        successMessage: 'Course deleted successfully'
      });

      // Update the local state
      setCourses(prev => prev.filter(course => course.id !== courseToDelete.id));
      setShowCourseDeleteModal(false);
      setCourseToDelete(null);

      // Refresh courses and voters
      fetchCourses();
      fetchVoters();

    } catch (error: any) {
      if (error.message?.includes('assigned to voters')) {
        showToast('error', 'Cannot delete course because it is assigned to voters. Please reassign or delete those voters first.');
      } else {
        showToast('error', error.message || 'Failed to delete course');
      }
      setShowCourseDeleteModal(false);
      setCourseToDelete(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        fetchVoters();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.course, filters.year, filters.section, filters.hasVoted, filters.isActive]);

  const getUniqueCoursesFromVoters = () => {
    return [...new Set(voters.map(v => v.course))].filter(Boolean).sort();
  };

  const filteredStudents = voters.filter(voter =>
    voter.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    voter.student_id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllFilteredStudents = () => {
    const filteredIds = filteredStudents.map(student => student.id);
    setSelectedStudents(filteredIds);
  };

  const clearAllStudents = () => {
    setSelectedStudents([]);
  };

  const handleDeleteAll = async () => {
    if (selectedStudents.length === 0) {
      showToast('warning', 'No voters selected for deletion');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      setDeleting(true);
      for (const studentId of selectedStudents) {
        await api.delete(`/voters/${studentId}`, {
          successMessage: `Successfully deleted ${selectedStudents.length} voter(s)`
        });
      }
      setSelectedStudents([]);
      setShowDeleteModal(false);
      fetchVoters();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete voters');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (voterId: number, isActive: boolean) => {
    try {
      await api.patch(`/voters/${voterId}`, { isActive }, {
        successMessage: `Voter ${isActive ? 'activated' : 'deactivated'} successfully`
      });
      fetchVoters();
      setShowMobileActions(null);
    } catch (error: any) {
      showToast('error', error.message || `Failed to ${isActive ? 'activate' : 'deactivate'} voter`);
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedStudents.length === 0) {
      showToast('warning', `No voters selected to ${isActive ? 'activate' : 'deactivate'}`);
      return;
    }

    try {
      setStatusAction(isActive ? 'activate' : 'deactivate');
      setShowStatusModal(true);
    } catch (error: any) {
      showToast('error', error.message || `Failed to ${isActive ? 'activate' : 'deactivate'} voters`);
    }
  };

  const confirmBulkStatusChange = async () => {
    try {
      setDeleting(true);
      await api.patch('/voters', {
        voterIds: selectedStudents,
        isActive: statusAction === 'activate'
      }, {
        successMessage: `Successfully ${statusAction === 'activate' ? 'activated' : 'deactivated'} ${selectedStudents.length} voter(s)`
      });

      setSelectedStudents([]);
      setShowStatusModal(false);
      setStatusAction(null);
      fetchVoters();
    } catch (error: any) {
      showToast('error', error.message || `Failed to ${statusAction === 'activate' ? 'activate' : 'deactivate'} voters`);
    } finally {
      setDeleting(false);
    }
  };

  const handleResetHasVoted = async (scope: 'all' | 'selected') => {
    if (scope === 'selected' && selectedStudents.length === 0) {
      showToast('warning', 'No voters selected to reset voting status');
      return;
    }

    try {
      setResetVoteAction(scope);
      setShowResetVoteModal(true);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to reset voting status');
    }
  };

  const confirmResetHasVoted = async () => {
    try {
      setDeleting(true);

      if (resetVoteAction === 'selected') {
        await api.patch('/voters/reset-votes', {
          voterIds: selectedStudents
        }, {
          successMessage: `Successfully reset voting status for ${selectedStudents.length} voter(s)`
        });
        setSelectedStudents([]);
      } else {
        await api.patch('/voters/reset-all-votes', {}, {
          successMessage: 'Successfully reset voting status for all voters'
        });
      }

      setShowResetVoteModal(false);
      setResetVoteAction(null);
      fetchVoters();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to reset voting status');
    } finally {
      setDeleting(false);
    }
  };

  const generatePasswordForStudent = (studentId: string, fullName: string, yearLevel: number, section: string): string => {
    try {
      const lastThreeDigits = studentId.trim().slice(-3);
      const nameParts = fullName.trim().split(/\s+/);
      const initials = nameParts.map(part => part.charAt(0).toLowerCase()).join('');
      const cleanSection = (section || '').replace(/\s+/g, '').toLowerCase();
      const generatedPassword = `${initials}${yearLevel}${cleanSection}-${lastThreeDigits}`;
      return generatedPassword;
    } catch (error) {
      return `${studentId.slice(-6)}-temp`;
    }
  };

  const generatePassword = () => {
    const { studentId, fullName, yearLevel, section } = formData;
    if (!fullName.trim()) {
      showToast('warning', 'Please enter full name first');
      return;
    }
    if (!studentId.trim()) {
      showToast('warning', 'Please enter student ID first');
      return;
    }
    try {
      const generatedPassword = generatePasswordForStudent(studentId, fullName, yearLevel, section);
      setFormData({ ...formData, password: generatedPassword });
      showToast('success', 'Password generated successfully');
    } catch (error) {
      showToast('error', 'Failed to generate password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVoter) {
        const updateData = {
          studentId: formData.studentId,
          fullName: formData.fullName,
          course: formData.course,
          yearLevel: formData.yearLevel,
          section: formData.section,
          password: formData.password,
          isActive: formData.isActive
        };

        await api.put(`/voters/${editingVoter.id}`, updateData, {
          successMessage: 'Voter updated successfully'
        });
        setShowModal(false);
        resetForm();
        fetchVoters();
      } else {
        await api.post('/voters', formData, {
          successMessage: 'Voter created successfully'
        });
        setShowModal(false);
        setShowSuccessModal(true);
        resetForm();
        fetchVoters();
      }
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('Student ID')) {
        setErrorMessage(error.message);
        setShowErrorModal(true);
      } else {
        showToast('error', error.message || 'Operation failed');
      }
    }
  };

  const handleEdit = (voter: Voter) => {
    setEditingVoter(voter);
    setFormData({
      studentId: voter.student_id,
      fullName: voter.full_name,
      course: voter.course,
      yearLevel: voter.year_level,
      section: voter.section,
      password: '', // Don't pre-fill password for security
      isActive: voter.is_active
    });
    setShowModal(true);
    setShowMobileActions(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this voter?')) return;
    try {
      await api.delete(`/voters/${id}`, {
        successMessage: 'Voter deleted successfully'
      });
      fetchVoters();
      setShowMobileActions(null);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete voter');
    }
  };

  const readFileContent = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result instanceof ArrayBuffer) {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/csv'
    ];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Please upload a valid Excel, Word, or CSV file');
      return;
    }
    try {
      setImporting(true);
      const fileContent = await readFileContent(file);
      let parsedData: any[] = [];
      if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
        parsedData = await parseExcelFile(fileContent, file);
      } else if (file.type.includes('word')) {
        parsedData = await parseWordFile(fileContent, file);
      } else if (file.type === 'text/csv') {
        const text = new TextDecoder().decode(fileContent);
        parsedData = await parseCSVFile(text);
      }
      const processedStudents = await processImportedData(parsedData);
      setImportedStudents(processedStudents);
      setImportStep('review');
    } catch (error: any) {
      showToast('error', `Failed to import file: ${error.message}`);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const parseExcelFile = async (fileContent: ArrayBuffer, _file: File): Promise<any[]> => {
    try {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(fileContent, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(firstSheet);
    } catch (error) {
      throw new Error('Failed to parse Excel file');
    }
  };

  const parseWordFile = async (fileContent: ArrayBuffer, _file: File): Promise<any[]> => {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer: fileContent });
      return parseTextToTable(result.value);
    } catch (error) {
      throw new Error('Failed to parse Word file');
    }
  };

  const parseCSVFile = (fileContent: string): any[] => {
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const parseTextToTable = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const data = [];
    for (let i = 0; i < lines.length; i++) {
      const cells = lines[i].split('\t').filter(cell => cell.trim());
      if (cells.length >= 2) {
        data.push({
          'Student ID': cells[0],
          'Name': cells.slice(1).join(' ')
        });
      }
    }
    return data;
  };

  const processImportedData = async (data: any[]): Promise<ImportedStudent[]> => {
    const processed: ImportedStudent[] = [];
    const existingStudentIds = new Set(voters.map(v => v.student_id.toLowerCase()));

    for (const row of data) {
      try {
        const studentId = extractStudentId(row);
        if (!studentId) {
          processed.push({
            studentId: '',
            fullName: '',
            course: '',
            yearLevel: 1,
            section: '',
            password: '',
            status: 'error',
            error: 'Student ID not found',
            originalData: row
          });
          continue;
        }

        const fullName = extractFullName(row);
        if (!fullName) {
          processed.push({
            studentId,
            fullName: '',
            course: '',
            yearLevel: 1,
            section: '',
            password: '',
            status: 'error',
            error: 'Name not found or invalid',
            originalData: row
          });
          continue;
        }

        const course = '';
        const yearLevel = extractYearLevel(row);
        const section = extractSection(row);

        if (existingStudentIds.has(studentId.toLowerCase())) {
          processed.push({
            studentId,
            fullName,
            course,
            yearLevel,
            section,
            password: '',
            status: 'duplicate',
            error: 'Student ID already exists',
            originalData: row
          });
          continue;
        }

        const password = generatePasswordForStudent(studentId, fullName, yearLevel, section);
        processed.push({
          studentId,
          fullName,
          course,
          yearLevel,
          section,
          password,
          status: 'new',
          originalData: row
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        processed.push({
          studentId: '',
          fullName: '',
          course: '',
          yearLevel: 1,
          section: '',
          password: '',
          status: 'error',
          error: `Processing error: ${errorMessage}`,
          originalData: row
        });
      }
    }
    return processed;
  };

  const extractYearLevel = (row: any): number => {
    const yearPatterns = ['year', 'yearlevel', 'year_level', 'level', 'yr'];
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (yearPatterns.some(pattern => lowerKey.includes(pattern))) {
        const value = row[key]?.toString().trim();
        if (value) {
          const year = parseInt(value);
          if (!isNaN(year) && year >= 1 && year <= 4) return year;
        }
      }
    }
    return 1;
  };

  const extractSection = (row: any): string => {
    const sectionPatterns = ['section', 'sec', 'class', 'group'];
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (sectionPatterns.some(pattern => lowerKey.includes(pattern))) {
        const value = row[key]?.toString().trim();
        if (value) return value;
      }
    }
    return '';
  };

  const isLikelyStudentId = (value: string): boolean => {
    if (!value) return false;
    const cleanValue = value.toString().trim();
    const studentIdPatterns = [
      /^\d{4}-\d{3}$/,
      /^\d{7,10}$/,
    ];
    return studentIdPatterns.some(pattern => pattern.test(cleanValue));
  };

  const extractFullName = (row: any): string => {
    const namePatterns = {
      firstName: ['firstname', 'first_name', 'fname', 'givenname', 'given_name', 'first name'],
      lastName: ['lastname', 'last_name', 'lname', 'familyname', 'family_name', 'last name'],
      middleName: ['middlename', 'middle_name', 'mname', 'middle name'],
      surname: ['surname', 'middleinitial', 'middle_initial', 'mi', 'initial'],
      fullName: ['name', 'fullname', 'full_name', 'studentname', 'student_name', 'complete_name']
    };
    const components = {
      firstName: '',
      lastName: '',
      middleName: '',
      surname: '',
      fullName: ''
    };
    for (const [key, value] of Object.entries(row)) {
      const stringValue = value?.toString().trim();
      if (!stringValue) continue;
      const lowerKey = key.toLowerCase().trim();
      for (const [type, patterns] of Object.entries(namePatterns)) {
        if (patterns.some(pattern => lowerKey.includes(pattern))) {
          if (!isLikelyStudentId(stringValue)) {
            components[type as keyof typeof components] = stringValue;
          }
          break;
        }
      }
    }
    if (components.fullName) {
      return formatName(components.fullName);
    }
    const nameParts = [];
    if (components.firstName) nameParts.push(components.firstName);
    const middlePart = components.middleName || components.surname;
    if (middlePart) nameParts.push(formatMiddleName(middlePart));
    if (components.lastName) nameParts.push(components.lastName);
    if (nameParts.length === 0) return '';
    const fullName = nameParts.join(' ');
    return formatName(fullName);
  };

  const formatMiddleName = (middleName: string): string => {
    if (!middleName) return '';
    if (middleName.length === 1 && /[a-zA-Z]/.test(middleName)) {
      return middleName + '.';
    }
    if (middleName.length === 2 && middleName.endsWith('.')) {
      return middleName;
    }
    return middleName;
  };

  const formatName = (name: string): string => {
    if (!name) return '';
    name = name.replace(/[^a-zA-Z\s.-]/g, '').replace(/\s+/g, ' ').trim();
    if (!name) return '';
    name = name.split(' ').map(part => {
      if (!part) return '';
      if (part.length <= 2 && part.endsWith('.')) return part;
      if (part.length === 1 && /[a-zA-Z]/.test(part)) return part + '.';
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }).join(' ');
    return name.replace(/\s+/g, ' ').trim();
  };

  const extractStudentId = (row: any): string => {
    const idPatterns = [
      'studentid', 'student_id', 'id', 'student', 'student no', 'studentno',
      'student number', 'studentnumber', 'matric', 'matriculation', 'studentidno'
    ];
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (idPatterns.some(pattern => lowerKey === pattern || lowerKey === pattern.replace(' ', ''))) {
        const value = row[key]?.toString().trim();
        if (value) return value.replace(/[^\w-]/g, '');
      }
    }
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (idPatterns.some(pattern => lowerKey.includes(pattern))) {
        const value = row[key]?.toString().trim();
        if (value) return value.replace(/[^\w-]/g, '');
      }
    }
    for (const key of Object.keys(row)) {
      const value = row[key]?.toString().trim();
      if (value && isLikelyStudentId(value)) {
        return value.replace(/[^\w-]/g, '');
      }
    }
    return '';
  };

  const handleImportSubmit = async () => {
    try {
      setImporting(true);
      const studentsToImport = importedStudents.filter(s => s.status === 'new');

      const studentsWithoutCourse = studentsToImport.filter(s => !s.course);
      if (studentsWithoutCourse.length > 0) {
        showToast('error', `Please select a course for ${studentsWithoutCourse.length} student(s)`);
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      for (const student of studentsToImport) {
        try {
          const password = generatePasswordForStudent(
            student.studentId,
            student.fullName,
            student.yearLevel,
            student.section
          );
          await api.post('/voters', {
            studentId: student.studentId,
            fullName: student.fullName,
            course: student.course,
            yearLevel: student.yearLevel,
            section: student.section,
            password: password
          });
          successCount++;
        } catch (error: any) {
          errorCount++;
          const studentIndex = importedStudents.findIndex(s => s.studentId === student.studentId);
          if (studentIndex !== -1) {
            updateImportedStudent(studentIndex, {
              status: 'error',
              error: error.message || 'Failed to create voter'
            });
          }
        }
      }
      setImportSummary({
        success: successCount,
        duplicates: importedStudents.filter(s => s.status === 'duplicate').length,
        errors: errorCount
      });
      setImportStep('complete');
      fetchVoters();
    } catch (error: any) {
      showToast('error', `Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const updateImportedStudent = (index: number, updates: Partial<ImportedStudent>) => {
    setImportedStudents(prev =>
      prev.map((student, i) =>
        i === index ? { ...student, ...updates } : student
      )
    );
  };

  const resetImport = () => {
    setImportedStudents([]);
    setImportStep('upload');
    setImportSummary({ success: 0, duplicates: 0, errors: 0 });
  };

  const toggleExportOption = (option: keyof ExportOptions) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const toggleAllExportOptions = (selectAll: boolean) => {
    setExportOptions({
      studentId: selectAll,
      fullName: selectAll,
      course: selectAll,
      yearLevel: selectAll,
      section: selectAll,
      hasVoted: selectAll,
      votedAt: selectAll,
      createdAt: selectAll,
      password: selectAll,
      isActive: selectAll
    });
  };

  const toggleExportCourse = (course: string) => {
    setSelectedExportCourses(prev =>
      prev.includes(course)
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const selectAllExportCourses = () => {
    const allCourses = getUniqueCoursesFromVoters();
    setSelectedExportCourses(allCourses);
  };

  const clearAllExportCourses = () => {
    setSelectedExportCourses([]);
  };

  const simulateProgress = () => {
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const handleExport = async () => {
    try {
      const selectedOptions = Object.entries(exportOptions)
        .filter(([, value]) => value)
        .map(([key]) => key);
      if (selectedOptions.length === 0) {
        showToast('warning', 'Please select at least one field to export');
        return;
      }
      setExporting(true);
      const progressInterval = simulateProgress();
      const params = new URLSearchParams();
      selectedOptions.forEach(field => {
        params.append('include[]', field);
      });
      if (selectedStudents.length > 0) {
        selectedStudents.forEach(id => {
          params.append('studentIds', id.toString());
        });
      }
      if (selectedStudents.length === 0 && selectedExportCourses.length > 0) {
        selectedExportCourses.forEach(course => {
          params.append('courses', course);
        });
      }
      if (selectedStudents.length === 0) {
        if (filters.course) params.append('course', filters.course);
        if (filters.year) params.append('year', filters.year);
        if (filters.section) params.append('section', filters.section);
        if (filters.hasVoted) params.append('hasVoted', filters.hasVoted);
        if (filters.isActive) params.append('isActive', filters.isActive);
        if (searchTerm) params.append('search', searchTerm);
      }
      if (exportOptions.password) {
        params.append('decryptPasswords', 'true');
      }
      const response = await api.get(`/voters/export?${params.toString()}`);
      clearInterval(progressInterval);
      setExportProgress(100);
      let exportData = response;
      if (response && typeof response === 'object') {
        if (response.success === false) {
          throw new Error(response.error || 'Export failed');
        }
        if (response.data !== undefined) {
          exportData = response.data;
        }
      }
      if (!exportData || exportData.length === 0) {
        showToast('warning', 'No data found for the selected filters');
        setExporting(false);
        setExportProgress(0);
        return;
      }
      const csvContent = convertToCSV(exportData);
      const filename = `voters_export_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      setTimeout(() => {
        setShowExportModal(false);
        setExporting(false);
        setExportProgress(0);
        setSelectedStudents([]);
        setStudentSearch('');
        showToast('success', `Exported ${exportData.length} record(s) successfully`);
      }, 500);
    } catch (error: any) {
      setExporting(false);
      setExportProgress(0);
      showToast('error', error.message || 'Failed to export data');
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const firstItem = data[0];
    if (!firstItem) return '';
    const keys = Object.keys(firstItem);
    if (keys.length === 0) return '';
    const headerMap: { [key: string]: string } = {
      'student_id': 'Student ID',
      'full_name': 'Full Name',
      'course': 'Course',
      'year_level': 'Year Level',
      'section': 'Section',
      'has_voted': 'Voting Status',
      'voted_at': 'Voted At',
      'created_at': 'Registered At',
      'password': 'Password',
      'is_active': 'Active Status'
    };
    const headers = keys.map(key => headerMap[key] || key);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        keys.map(key => {
          let value = row[key] || '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = value.replace(/"/g, '""');
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ];
    return csvRows.join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      fullName: '',
      course: '',
      yearLevel: 1,
      section: '',
      password: '',
      isActive: true
    });
    setEditingVoter(null);
  };

  const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
      {isActive ? (
        <>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></div>
          Active
        </>
      ) : (
        <>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
          Inactive
        </>
      )}
    </span>
  );

  const filteredVoters = voters;
  const uniqueCourses = getUniqueCoursesFromVoters();
  const uniqueYears = [...new Set(voters.map(v => v.year_level.toString()))];
  const uniqueSections = [...new Set(voters.map(v => v.section))];

  if (loading || coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading voters..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 animate-fadeIn p-3 sm:p-4 lg:p-6">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform animate-scaleIn">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Voter has been created and can now participate in the election.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform animate-scaleIn">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Duplicate Found</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {errorMessage || "A voter with this Student ID already exists."}
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowErrorModal(false);
                    setShowModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Delete Confirmation Modal - HIGHER Z-INDEX */}
      {showCourseDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full transform animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Delete Course</h2>
              <button
                onClick={() => {
                  setShowCourseDeleteModal(false);
                  setCourseToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-800 font-medium">Warning: This action cannot be undone</p>
                    <p className="text-xs text-red-700 mt-1">
                      You are about to delete the course "{courseToDelete?.name}". This will permanently remove the course from the system.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{courseToDelete?.name}</span> ({courseToDelete?.code})?
                <br />
                <span className="text-xs text-gray-500 mt-1 block">
                  Course ID: {courseToDelete?.id}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseDeleteModal(false);
                    setCourseToDelete(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Vote Modal */}
      <Modal
        isOpen={showResetVoteModal}
        onClose={() => setShowResetVoteModal(false)}
        title="Reset Voting Status"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Reset Voting Status</p>
                <p className="text-xs text-blue-700 mt-1">
                  This will reset the has_voted status to false for {resetVoteAction === 'selected' ? 'selected voters' : 'all voters'}.
                  Voters will be able to vote again.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to reset voting status for {resetVoteAction === 'selected' ? `${selectedStudents.length} selected voter(s)` : 'all voters'}?
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowResetVoteModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmResetHasVoted}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Resetting...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Voting Status
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`${statusAction === 'activate' ? 'Activate' : 'Deactivate'} Selected Voters`}
        size="sm"
      >
        <div className="space-y-4">
          <div className={`border ${statusAction === 'activate' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} p-4 rounded-xl`}>
            <div className="flex items-start space-x-3">
              <AlertCircle className={`w-5 h-5 ${statusAction === 'activate' ? 'text-green-600' : 'text-gray-600'} mt-0.5 flex-shrink-0`} />
              <div>
                <p className={`text-sm ${statusAction === 'activate' ? 'text-green-800' : 'text-gray-800'} font-medium`}>
                  {statusAction === 'activate' ? 'Activate' : 'Deactivate'} {selectedStudents.length} voter(s)
                </p>
                <p className={`text-xs ${statusAction === 'activate' ? 'text-green-700' : 'text-gray-700'} mt-1`}>
                  {statusAction === 'activate'
                    ? 'Active voters will be able to participate in elections.'
                    : 'Inactive voters will not be able to vote in elections.'
                  }
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to {statusAction === 'activate' ? 'activate' : 'deactivate'} the selected voters?
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowStatusModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmBulkStatusChange}
              className={`flex-1 ${statusAction === 'activate'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-500 hover:bg-gray-600'
                } text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center`}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {statusAction === 'activate' ? 'Activating...' : 'Deactivating...'}
                  </span>
                </>
              ) : (
                <>
                  {statusAction === 'activate' ? <UserCheck className="w-4 h-4 mr-2" /> : <UserX className="w-4 h-4 mr-2" />}
                  {statusAction === 'activate' ? 'Activate' : 'Deactivate'} ({selectedStudents.length})
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Voter Management
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  Manage student voters and their information
                </p>
              </div>
            </div>
            {canEditPasswordOnly && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs font-medium text-amber-800">
                  Voting is {isVotingActive ? 'active' : 'paused'} - only password and status updates allowed
                </span>
              </div>
            )}
            {canEditAllFields && (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs font-medium text-green-800">
                  Voting is finished - all voter data can be edited
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-end">
              {/* FIX: Hide Courses button when voting is active or paused */}
              {!(isVotingActive || isVotingPaused) && (
                <button
                  onClick={() => setShowCoursesModal(true)}
                  className="flex items-center space-x-2 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[120px]"
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Courses</span>
                </button>
              )}

              {!(isVotingActive || isVotingPaused) && (
                <button
                  onClick={() => handleResetHasVoted('all')}
                  className="flex items-center space-x-2 px-3 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[120px]"
                >
                  <RefreshCw className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Reset All Votes</span>
                  <span className="text-xs sm:text-sm sm:hidden">Reset All</span>
                </button>
              )}

              <button
                onClick={() => setShowImportModal(true)}
                disabled={canEditPasswordOnly}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[120px] ${canEditPasswordOnly
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
              >
                <Upload className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Import</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[120px]"
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Export</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                disabled={canEditPasswordOnly}
                className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[120px] ${canEditPasswordOnly
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
              >
                <UserPlus className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm hidden sm:inline">Add Voter</span>
                <span className="text-xs sm:text-sm sm:hidden">Add</span>
              </button>
            </div>

            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-end">
                <button
                  onClick={() => handleBulkStatusChange(true)}
                  disabled={canEditPasswordOnly}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[140px] ${canEditPasswordOnly
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                >
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Activate ({selectedStudents.length})</span>
                </button>
                <button
                  onClick={() => handleBulkStatusChange(false)}
                  disabled={canEditPasswordOnly}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[140px] ${canEditPasswordOnly
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-500 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                >
                  <UserX className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Deactivate ({selectedStudents.length})</span>
                </button>
                <button
                  onClick={() => handleResetHasVoted('selected')}
                  className="flex items-center space-x-2 px-3 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[140px]"
                >
                  <RefreshCw className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Reset Votes ({selectedStudents.length})</span>
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={canEditPasswordOnly}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none justify-center min-w-[140px] ${canEditPasswordOnly
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">Delete ({selectedStudents.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Student ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 flex-1 max-w-3xl">
                <select
                  value={filters.course}
                  onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>

                <select
                  value={filters.section}
                  onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">All Sections</option>
                  {uniqueSections.map(section => (
                    <option key={section} value={section}>Sec {section}</option>
                  ))}
                </select>

                <select
                  value={filters.hasVoted}
                  onChange={(e) => setFilters({ ...filters, hasVoted: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="voted">Has Voted</option>
                  <option value="not_voted">Not Voted</option>
                </select>

                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm"
                >
                  <option value="">All Active</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voters Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Student Voters
              <span className="text-gray-500 font-normal ml-2">({filteredVoters.length})</span>
              {selectedStudents.length > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedStudents.length} selected
                </span>
              )}
            </h2>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <RefreshCw
                className="w-4 h-4 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={fetchVoters}
              />
              <span>Last updated</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden lg:table w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="w-12 px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === voters.length && voters.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(voters.map(v => v.id));
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    disabled={canEditPasswordOnly}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Course & Year
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Voting Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVoters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <User className="w-12 h-12 text-gray-300" />
                      <div>
                        <p className="text-gray-500 font-medium">No voters found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm || Object.values(filters).some(Boolean)
                            ? "Try adjusting your search or filters"
                            : "Get started by adding your first voter"
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVoters.map((voter) => (
                  <tr
                    key={voter.id}
                    className={`transition-colors duration-150 ${selectedStudents.includes(voter.id)
                      ? 'bg-blue-50/50 border-l-2 border-l-blue-500'
                      : 'hover:bg-gray-50/80'
                      } ${!voter.is_active ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(voter.id)}
                        onChange={() => toggleStudentSelection(voter.id)}
                        disabled={canEditPasswordOnly}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${voter.is_active
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                          }`}>
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-medium ${voter.is_active ? 'text-gray-900' : 'text-gray-500'} ${!voter.is_active ? 'line-through' : ''}`}>
                            {voter.full_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Hash className="w-3 h-3 mr-1" />
                            {voter.student_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className={`font-medium text-sm ${voter.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {voter.course}
                          </p>
                          <p className="text-xs text-gray-500">Year {voter.year_level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${voter.is_active
                        ? 'bg-gray-100 text-gray-800 border-gray-200'
                        : 'bg-gray-50 text-gray-500 border-gray-300'
                        }`}>
                        Section {voter.section}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge isActive={voter.is_active} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${voter.has_voted
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                          } ${!voter.is_active ? 'opacity-50' : ''}`}>
                          {voter.has_voted ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                              Voted
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></div>
                              Not Voted
                            </>
                          )}
                        </span>
                        {voter.has_voted && voter.voted_at && (
                          <span className="text-xs text-gray-500">
                            {new Date(voter.voted_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(voter.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(voter)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                          title={canEditPasswordOnly ? "Update Password and Status" : "Edit Voter"}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {voter.is_active ? (
                          <button
                            onClick={() => handleStatusChange(voter.id, false)}
                            disabled={canEditPasswordOnly}
                            className={`p-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${canEditPasswordOnly
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                              }`}
                            title={canEditPasswordOnly ? "Cannot deactivate during voting" : "Deactivate Voter"}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(voter.id, true)}
                            disabled={canEditPasswordOnly}
                            className={`p-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${canEditPasswordOnly
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                              }`}
                            title={canEditPasswordOnly ? "Cannot activate during voting" : "Activate Voter"}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(voter.id)}
                          disabled={canEditPasswordOnly}
                          className={`p-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${canEditPasswordOnly
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                            }`}
                          title={canEditPasswordOnly ? "Cannot delete during voting" : "Delete Voter"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="lg:hidden space-y-3 p-4">
            {filteredVoters.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No voters found</p>
              </div>
            ) : (
              filteredVoters.map((voter) => (
                <div
                  key={voter.id}
                  className={`bg-white border border-gray-200 rounded-2xl p-4 space-y-4 transition-all duration-200 ${selectedStudents.includes(voter.id)
                    ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50/30'
                    : 'hover:shadow-md'
                    } ${!voter.is_active ? 'bg-gray-50/50 border-gray-300' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(voter.id)}
                        onChange={() => toggleStudentSelection(voter.id)}
                        disabled={canEditPasswordOnly}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 transition-colors"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${voter.is_active
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${voter.is_active ? 'text-gray-900' : 'text-gray-500'} ${!voter.is_active ? 'line-through' : ''}`}>
                          {voter.full_name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center truncate">
                          <Hash className="w-3 h-3 mr-1 flex-shrink-0" />
                          {voter.student_id}
                        </p>
                        <div className="mt-1">
                          <StatusBadge isActive={voter.is_active} />
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowMobileActions(showMobileActions === voter.id ? null : voter.id)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showMobileActions === voter.id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-48 overflow-hidden">
                          <button
                            onClick={() => handleEdit(voter)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>{canEditPasswordOnly ? 'Update Password & Status' : 'Edit'}</span>
                          </button>
                          {voter.is_active ? (
                            <button
                              onClick={() => handleStatusChange(voter.id, false)}
                              disabled={canEditPasswordOnly}
                              className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors ${canEditPasswordOnly
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <UserX className="w-4 h-4" />
                              <span>Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(voter.id, true)}
                              disabled={canEditPasswordOnly}
                              className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors ${canEditPasswordOnly
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <UserCheck className="w-4 h-4" />
                              <span>Activate</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(voter.id)}
                            disabled={canEditPasswordOnly}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors ${canEditPasswordOnly
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-gray-50'
                              }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`font-medium truncate ${voter.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                          {voter.course}
                        </p>
                        <p className="text-gray-600">Year {voter.year_level}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${voter.is_active
                        ? 'bg-gray-100 text-gray-800 border-gray-200'
                        : 'bg-gray-50 text-gray-500 border-gray-300'
                        }`}>
                        Section {voter.section}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${voter.has_voted
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                      } ${!voter.is_active ? 'opacity-50' : ''}`}>
                      {voter.has_voted ? 'Voted' : 'Not Voted'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(voter.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {voter.has_voted && voter.voted_at && (
                    <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
                      Voted on {new Date(voter.voted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {filteredVoters.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
              <div>
                Showing <span className="font-semibold">{filteredVoters.length}</span> voters
              </div>
              {selectedStudents.length > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-blue-700">
                    {selectedStudents.length} voters selected
                  </span>
                  <button
                    onClick={clearAllStudents}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingVoter ? (canEditPasswordOnly ? 'Update Password and Status' : 'Edit Voter') : 'Add New Voter'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Student ID
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required={!editingVoter}
                readOnly={!!editingVoter && canEditPasswordOnly}
                disabled={!!editingVoter && canEditPasswordOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required={!editingVoter}
                readOnly={!!editingVoter && canEditPasswordOnly}
                disabled={!!editingVoter && canEditPasswordOnly}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-2" />
              Course
            </label>
            <div className="relative">
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                required={!editingVoter}
                disabled={!!editingVoter && canEditPasswordOnly}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
              <select
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required={!editingVoter}
                disabled={!!editingVoter && canEditPasswordOnly}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required={!editingVoter}
                readOnly={!!editingVoter && canEditPasswordOnly}
                disabled={!!editingVoter && canEditPasswordOnly}
              />
            </div>
          </div>

          {editingVoter && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active Voter
              </label>
              <span className="text-xs text-gray-500 ml-auto">
                {formData.isActive ? 'Can participate in elections' : 'Cannot vote in elections'}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <Key className="w-4 h-4 inline mr-2" />
                Password {editingVoter && '(leave blank to keep current)'}
              </label>
              {editingVoter && (
                <button
                  type="button"
                  onClick={generatePassword}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 text-xs flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Auto Generate</span>
                </button>
              )}
            </div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required={!editingVoter}
              minLength={6}
              placeholder={canEditPasswordOnly ? "Enter new password" : ""}
              readOnly={!editingVoter}
            />
            {formData.password && (
              <p className="text-xs text-gray-500 mt-1">
                {editingVoter ? 'Current password:' : 'Auto-generated password:'} <span className="font-mono">{formData.password}</span>
              </p>
            )}
            {canEditPasswordOnly && editingVoter && (
              <p className="text-xs text-gray-500 mt-1">
                Only password and status can be updated during active voting
              </p>
            )}
            {canEditAllFields && editingVoter && (
              <p className="text-xs text-gray-500 mt-1">
                All voter data can be edited since voting is finished
              </p>
            )}
            {!editingVoter && (
              <p className="text-xs text-gray-500 mt-1">
                Password will be auto-generated when all fields are filled
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {editingVoter
                ? (canEditPasswordOnly ? 'Update Password & Status' : 'Update Voter')
                : 'Create Voter'
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Selected Voters"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Warning: This action cannot be undone</p>
                <p className="text-xs text-red-700 mt-1">
                  You are about to delete {selectedStudents.length} voter(s). This will permanently remove all selected voter accounts and their data.
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete the selected voters?
          </p>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteAll}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedStudents.length})
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Export Selection Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setExporting(false);
          setExportProgress(0);
          setSelectedStudents([]);
          setStudentSearch('');
          setSelectedExportCourses([]);
        }}
        title="Export Voters Data"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Password Decryption</p>
                <p className="text-xs text-yellow-700">
                  Hashed passwords from the database will be decrypted to plain text during export.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Student Selection */}
            <div className="lg:col-span-1 space-y-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-700 text-sm">Select Students:</p>
                  <button
                    type="button"
                    onClick={() => setShowStudentSelection(!showStudentSelection)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-lg transition-all duration-200 text-xs"
                  >
                    {showStudentSelection ? 'Hide' : 'Select'}
                  </button>
                </div>

                {showStudentSelection && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                      {filteredStudents.length === 0 ? (
                        <p className="text-center py-4 text-gray-500 text-sm">No students found</p>
                      ) : (
                        filteredStudents.map(student => (
                          <label
                            key={student.id}
                            className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{student.full_name}</p>
                              <p className="text-xs text-gray-600 truncate">{student.student_id}</p>
                              <p className="text-xs text-gray-500 truncate">{student.course}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">
                        {selectedStudents.length} selected
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={selectAllFilteredStudents}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={clearAllStudents}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!showStudentSelection && (
                  <p className="text-sm text-gray-600">
                    {selectedStudents.length > 0
                      ? `${selectedStudents.length} student(s) selected`
                      : 'All students will be exported'
                    }
                  </p>
                )}
              </div>

              {/* Course Selection with Year and Section Filters */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-700 text-sm">Filter by Course:</p>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={selectAllExportCourses}
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={clearAllExportCourses}
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 mb-4">
                  {uniqueCourses.map(course => (
                    <label
                      key={course}
                      className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExportCourses.includes(course)}
                        onChange={() => toggleExportCourse(course)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 truncate">{course}</span>
                    </label>
                  ))}
                </div>

                {/* Year and Section Filters - Only show when courses are selected */}
                {selectedExportCourses.length > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                      <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Years</option>
                        {uniqueYears.map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                      <select
                        value={filters.section}
                        onChange={(e) => setFilters({ ...filters, section: e.target.value })}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Sections</option>
                        {uniqueSections.map(section => (
                          <option key={section} value={section}>Sec {section}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Course filtering works alongside student selection
                </p>
              </div>
            </div>

            {/* Field Selection */}
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium text-gray-700 text-sm">Select fields to export:</p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleAllExportOptions(true)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-lg transition-all duration-200 text-xs"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllExportOptions(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded-lg transition-all duration-200 text-xs"
                    >
                      None
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2">
                  {Object.entries(exportOptions).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleExportOption(key as keyof ExportOptions)}
                        className="flex items-center space-x-3 w-full text-left"
                      >
                        {value ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-700 flex-1">
                          {key === 'studentId' ? 'Student ID' :
                            key === 'fullName' ? 'Full Name' :
                              key === 'yearLevel' ? 'Year Level' :
                                key === 'hasVoted' ? 'Voting Status' :
                                  key === 'votedAt' ? 'Voted At' :
                                    key === 'createdAt' ? 'Registered At' :
                                      key === 'password' ? 'Password' :
                                        key === 'isActive' ? 'Active Status' :
                                          key}
                        </span>
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {exporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Exporting data...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowExportModal(false);
                setExporting(false);
                setExportProgress(0);
                setSelectedStudents([]);
                setStudentSearch('');
                setSelectedExportCourses([]);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              disabled={exporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Exporting... ({exportProgress}%)</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {selectedStudents.length === 1 ? 'Export Student' : 'Export Data'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          resetImport();
        }}
        title="Import Voters"
        size="lg"
      >
        <div className="space-y-4">
          {importStep === 'upload' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Import Instructions</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Upload an Excel, CSV, or Word file containing student data. The system will automatically detect columns for Student ID, Name, Year Level, and Section.
                      <strong> Course will be left blank and must be selected for each voter in the next step using the dropdown menu.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-import"
                  onChange={handleFileImport}
                  accept=".xlsx,.xls,.csv,.docx,.doc"
                  className="hidden"
                />
                <label htmlFor="file-import" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports Excel, CSV, and Word documents
                  </p>
                </label>
              </div>
            </div>
          )}

          {importStep === 'review' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Review Import Data</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Please review the imported data and select a course for each voter using the dropdown menu before proceeding.
                      New records will be created, duplicates will be skipped.
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Student ID</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Course</th>
                      <th className="px-3 py-2 text-left">Year</th>
                      <th className="px-3 py-2 text-left">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedStudents.map((student, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-2">
                          {student.status === 'new' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              New
                            </span>
                          )}
                          {student.status === 'duplicate' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Duplicate
                            </span>
                          )}
                          {student.status === 'error' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              <X className="w-3 h-3 mr-1" />
                              Error
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2">{student.studentId}</td>
                        <td className="px-3 py-2">{student.fullName}</td>
                        <td className="px-3 py-2">
                          {student.status === 'new' ? (
                            <select
                              value={student.course}
                              onChange={(e) => updateImportedStudent(index, { course: e.target.value })}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              <option value="">Select course</option>
                              {courses.map(course => (
                                <option key={course.id} value={course.name}>
                                  {course.name} ({course.code})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{student.yearLevel}</td>
                        <td className="px-3 py-2">{student.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Total: {importedStudents.length} records
                </span>
                <div className="flex space-x-2">
                  <span className="text-green-600">
                    New: {importedStudents.filter(s => s.status === 'new').length}
                  </span>
                  <span className="text-yellow-600">
                    Duplicates: {importedStudents.filter(s => s.status === 'duplicate').length}
                  </span>
                  <span className="text-red-600">
                    Errors: {importedStudents.filter(s => s.status === 'error').length}
                  </span>
                </div>
              </div>

              {/* Course selection validation warning */}
              {importedStudents.filter(s => s.status === 'new' && !s.course).length > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    Please select a course for all new voters ({importedStudents.filter(s => s.status === 'new' && !s.course).length} remaining)
                  </p>
                </div>
              )}
            </div>
          )}

          {importStep === 'complete' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Import Complete!</h3>
                <p className="text-gray-600 text-sm">
                  Successfully processed {importSummary.success} new voters.
                </p>
                {importSummary.duplicates > 0 && (
                  <p className="text-yellow-600 text-sm mt-1">
                    {importSummary.duplicates} duplicate records were skipped.
                  </p>
                )}
                {importSummary.errors > 0 && (
                  <p className="text-red-600 text-sm mt-1">
                    {importSummary.errors} records had errors and were not imported.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            {importStep !== 'upload' && (
              <button
                type="button"
                onClick={() => setImportStep('upload')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                disabled={importing}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowImportModal(false);
                resetImport();
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              disabled={importing}
            >
              {importStep === 'complete' ? 'Close' : 'Cancel'}
            </button>
            {importStep === 'review' && (
              <button
                onClick={handleImportSubmit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                disabled={importing || importedStudents.filter(s => s.status === 'new' && !s.course).length > 0}
              >
                {importing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {importedStudents.filter(s => s.status === 'new').length} Voters
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Courses Modal - Hide when delete modal is open */}
      <Modal
        isOpen={showCoursesModal && !showCourseDeleteModal}
        onClose={() => {
          setShowCoursesModal(false);
          setNewCourse({ name: '', code: '' });
        }}
        title="Manage Courses"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Course Management</p>
                <p className="text-xs text-blue-700 mt-1">
                  Add or remove courses that voters can be assigned to.
                </p>
              </div>
            </div>
          </div>

          {/* Add Course Form */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Course</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., CS"
                />
              </div>
            </div>
            <button
              onClick={addCourse}
              disabled={addingCourse || !newCourse.name.trim() || !newCourse.code.trim()}
              className="w-full mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {addingCourse ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </>
              )}
            </button>
          </div>

          {/* Courses List */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Existing Courses</h3>
              <span className="text-xs text-gray-500">{courses.length} course(s)</span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {courses.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No courses found</p>
                  <p className="text-gray-400 text-xs mt-1">Add your first course above</p>
                </div>
              ) : (
                courses.map(course => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">Code: {course.code}</p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">ID: {course.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCourse(course)}
                      disabled={canEditPasswordOnly}
                      className={`p-2 rounded-lg transition-all duration-200 ${canEditPasswordOnly
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50 group-hover:opacity-100 opacity-70'
                        }`}
                      title={canEditPasswordOnly ? "Cannot delete during voting" : "Delete course"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCoursesModal(false);
                setNewCourse({ name: '', code: '' });
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};