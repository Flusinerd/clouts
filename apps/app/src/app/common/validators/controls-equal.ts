import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const controlsEqualValidator = (
  ...controlNames: string[]
): ValidatorFn => {
  return (group: AbstractControl): ValidationErrors | null => {
    const controls = controlNames.map(
      (name) => group.get(name) as AbstractControl
    );
    const firstControlValue = controls[0].value;
    const allEqual = controls.every(
      (control) => control.value === firstControlValue
    );
    return allEqual ? null : { controlsNotEqual: true };
  };
};
