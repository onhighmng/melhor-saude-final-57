import Papa from 'papaparse';
import { z } from 'zod';

export interface CSVEmployee {
  name: string;
  email: string;
}

export interface CSVValidationError {
  line: number;
  field: string;
  message: string;
  email?: string;
}

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
});

export const parseEmployeeCSV = (file: File): Promise<{
  employees: CSVEmployee[];
  errors: CSVValidationError[];
}> => {
  return new Promise((resolve) => {
    const errors: CSVValidationError[] = [];
    const employees: CSVEmployee[] = [];
    const emailSet = new Set<string>();

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize headers to handle different cases
        const normalized = header.toLowerCase().trim();
        if (normalized === 'nome' || normalized === 'name') return 'name';
        if (normalized === 'email' || normalized === 'e-mail') return 'email';
        return normalized;
      },
      complete: (results) => {
        results.data.forEach((row: any, index: number) => {
          const lineNumber = index + 2; // +2 because: 1 for header, 1 for 0-index

          // Check if required fields exist
          if (!row.name && !row.email) {
            return; // Skip completely empty rows
          }

          if (!row.name || !row.email) {
            errors.push({
              line: lineNumber,
              field: !row.name ? 'name' : 'email',
              message: 'Missing required field',
            });
            return;
          }

          // Validate with Zod
          const validation = employeeSchema.safeParse({
            name: row.name?.trim(),
            email: row.email?.trim().toLowerCase(),
          });

          if (!validation.success) {
            const error = validation.error.errors[0];
            errors.push({
              line: lineNumber,
              field: error.path[0] as string,
              message: error.message,
              email: row.email,
            });
            return;
          }

          // Check for duplicates within CSV
          const email = validation.data.email;
          if (emailSet.has(email)) {
            errors.push({
              line: lineNumber,
              field: 'email',
              message: 'Duplicate email',
              email,
            });
            return;
          }

          emailSet.add(email);
          // Type assertion needed because Zod inference doesn't flow perfectly
          employees.push(validation.data as CSVEmployee);
        });

        resolve({ employees, errors });
      },
      error: () => {
        resolve({ 
          employees: [], 
          errors: [{ line: 0, field: 'file', message: 'Failed to parse CSV file' }] 
        });
      },
    });
  });
};

export const generateAccessCode = (companyPrefix: string = 'MS'): string => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return `${companyPrefix}-${code}`;
};

export const generateUniqueAccessCodes = (
  count: number, 
  existingCodes: Set<string>,
  companyPrefix: string = 'MS'
): string[] => {
  const codes: string[] = [];
  const allCodes = new Set([...existingCodes]);

  while (codes.length < count) {
    const newCode = generateAccessCode(companyPrefix);
    if (!allCodes.has(newCode)) {
      allCodes.add(newCode);
      codes.push(newCode);
    }
  }

  return codes;
};

export const downloadCSVTemplate = () => {
  const csvContent = `Nome,Email
Ana Silva,ana.silva@exemplo.com
João Santos,joao.santos@exemplo.com
Maria Costa,maria.costa@exemplo.com`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'modelo_colaboradores.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportEmployeesWithCodes = (
  employees: Array<{ name: string; email: string; code: string | null }>,
  companyName: string
): void => {
  const csvRows = [
    ['Nome', 'Email', 'Código de Acesso'],
    ...employees.map(emp => [emp.name, emp.email, emp.code || 'Não gerado'])
  ];

  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `${companyName.replace(/\s+/g, '_')}_codigos_${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};