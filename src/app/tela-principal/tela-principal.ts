import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ResumoMatricula } from '../cadastro.types';
import { ResumoModalComponent } from '../resumo-modal/resumo-modal';

const phonePattern = /^[0-9()\s-]{8,20}$/;

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const senha = control.get('senha')?.value;
  const confirmarSenha = control.get('confirmarSenha')?.value;

  if (!senha || !confirmarSenha) {
    return null;
  }

  return senha === confirmarSenha ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-tela-principal',
  imports: [ReactiveFormsModule, ResumoModalComponent],
  templateUrl: './tela-principal.html',
  styleUrl: './tela-principal.css',
})
export class TelaPrincipalComponent {
  private readonly fb = inject(FormBuilder);

  readonly cidades = [
    'Colatina',
    'Marilandia',
    'Linhares',
    'Vitoria',
    'Serra',
    'Outra',
  ];

  readonly generos = [
    'Feminino',
    'Masculino',
    'Nao binario',
    'Prefiro nao informar',
  ];

  readonly resumoCadastro = signal<ResumoMatricula | null>(null);

  readonly matriculaForm = this.fb.group(
    {
      nome: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.email,
      ]),
      telefones: this.fb.array([this.createPhoneControl()]),
      idade: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(18),
      ]),
      senha: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmarSenha: this.fb.nonNullable.control('', Validators.required),
      genero: this.fb.nonNullable.control('', Validators.required),
      cidade: this.fb.nonNullable.control('', Validators.required),
      termos: this.fb.nonNullable.control(false, Validators.requiredTrue),
    },
    { validators: passwordsMatchValidator },
  );

  get telefones(): FormArray<FormControl<string>> {
    return this.matriculaForm.controls.telefones;
  }

  addTelefone(): void {
    this.telefones.push(this.createPhoneControl());
  }

  removeTelefone(index: number): void {
    if (this.telefones.length === 1) {
      return;
    }

    this.telefones.removeAt(index);
    this.telefones.markAsDirty();
    this.telefones.markAsTouched();
    this.telefones.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.matriculaForm.invalid) {
      this.matriculaForm.markAllAsTouched();
      return;
    }

    const formulario = this.matriculaForm.getRawValue();

    this.resumoCadastro.set({
      nome: formulario.nome,
      email: formulario.email,
      telefones: formulario.telefones,
      idade: formulario.idade ?? 0,
      genero: formulario.genero,
      cidade: formulario.cidade,
      senhaMascarada: '*'.repeat(formulario.senha.length),
      termos: formulario.termos,
    });
  }

  resetForm(): void {
    while (this.telefones.length > 1) {
      this.telefones.removeAt(this.telefones.length - 1);
    }

    this.telefones.at(0).reset('');
    this.matriculaForm.reset({
      nome: '',
      email: '',
      idade: null,
      senha: '',
      confirmarSenha: '',
      genero: '',
      cidade: '',
      termos: false,
    });
    this.matriculaForm.markAsPristine();
    this.matriculaForm.markAsUntouched();
    this.matriculaForm.updateValueAndValidity();
    this.resumoCadastro.set(null);
  }

  fecharResumo(): void {
    this.resumoCadastro.set(null);
  }

  hasControlError(
    controlName: keyof Omit<typeof this.matriculaForm.controls, 'telefones'>,
    errorKey: string,
  ): boolean {
    const control = this.matriculaForm.controls[controlName];
    return control.hasError(errorKey) && (control.touched || control.dirty);
  }

  hasPhoneError(index: number, errorKey: string): boolean {
    const control = this.telefones.at(index);
    return control.hasError(errorKey) && (control.touched || control.dirty);
  }

  hasPasswordMismatch(): boolean {
    const confirmacao = this.matriculaForm.controls.confirmarSenha;
    return (
      this.matriculaForm.hasError('passwordMismatch') &&
      (confirmacao.touched || confirmacao.dirty)
    );
  }

  private createPhoneControl(): FormControl<string> {
    return this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(phonePattern),
    ]);
  }
}
