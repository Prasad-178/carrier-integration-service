import type { ZodIssue } from 'zod';
import { ShippingError } from './base.error';

export class ValidationError extends ShippingError {
  readonly issues: ZodIssue[];

  constructor(message: string, issues: ZodIssue[]) {
    super(message, 'VALIDATION_ERROR', {
      issues: issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
        code: i.code,
      })),
    });
    this.name = 'ValidationError';
    this.issues = issues;
  }

  getFieldErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    for (const issue of this.issues) {
      const path = issue.path.join('.') || 'root';
      if (!errors[path]) errors[path] = [];
      errors[path]!.push(issue.message);
    }
    return errors;
  }
}
