import { Component } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { PacienteService } from '../../../services/paciente.service';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    RouterLink,
    DialogModule 
  ]
  
})
export class RegisterComponent {
  password: string = '';
  confirmPassword: string = '';
  showPasswordError: boolean = false;
  registerForm: FormGroup;
  showMFAModal = false;
  mfaData: any;
  verificationCode = '';



  constructor(
    private fb: FormBuilder,
    private router: Router,
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      appaterno: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apmaterno: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(12),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/)

      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  validatePasswords() {
    this.showPasswordError = !this.passwordsMatch();
  }
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  get f() { return this.registerForm.controls; }

 
  getQRCodeImage() {
    if (!this.mfaData?.mfaUrl) return '';
    const encodedUrl = encodeURIComponent(this.mfaData.mfaUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  }

  onSubmit() {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  const formData = this.registerForm.value;

  const payload = {
    nombre: formData.nombre,
    appaterno: formData.appaterno,
    apmaterno: formData.apmaterno,
    correo: formData.correo,
    contrasena: formData.password // 👈 aquí la corrección clave
  };

  this.pacienteService.registrarPaciente(payload).subscribe({
    next: (response) => {
      this.mfaData = response.data;
      this.showMFAModal = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Registro exitoso',
        detail: response.message
      });
    },
    error: (err) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.error?.message || 'Error en el registro'
      });
    }
  });
}



  closeMFAModal() {
  this.showMFAModal = false;
  this.router.navigate(['/auth/login']); // ✅ Redirecciona al login
}


  handleQRImageError() {
  console.error('Error al cargar la imagen QR');
  // Puedes implementar un fallback aquí si lo deseas
}
}   