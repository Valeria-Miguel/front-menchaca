import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterLink,
    DialogModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  mfaForm: FormGroup;

  showMFAInput = false;
  showQRCode = false;
  tempToken: string | undefined;
  qrUrl: string = '';
  mfaConfigured = false;
  mfaSecret: string = '';


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });

    this.mfaForm = this.fb.group({
      totp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  get mfa() {
    return this.mfaForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { correo, contrasena } = this.loginForm.value;
    this.authService.login({ correo, password: contrasena }).subscribe({
      next: res => {
          const data = res.data;
        // MFA requerido pero aún no verificado
        if (data?.mfaRequired && data?.tempToken) {
          this.tempToken = data.tempToken;
          this.showMFAInput = true;
          return;
        }

        if (data?.mfaConfigured && data?.qrUrl) {
          this.tempToken = data.tempToken;
          this.qrUrl = data.qrUrl;
          this.mfaSecret = data.secret || '';
          console.log('QR URL recibida:', this.qrUrl);
          this.mfaConfigured = true;
          this.showQRCode = true;
          this.showMFAInput = true;
          return;
        }

        // Login exitoso normal (sin MFA)
        this.redirectByIntCode(data?.intCode || 'default');
        console.log('intCode recibido del backend:', data?.intCode);


  },

    error: err => {
      console.error('Error en login:', err);
      alert(err.error?.message || 'Error al iniciar sesión');
    }
  });
}

  onSubmitMFA() {
  if (this.mfaForm.invalid) {
    this.mfaForm.markAllAsTouched(); 
    return;
  }

  const totp = this.mfaForm.value.totp;

  if (!this.tempToken) {
    console.error('No hay tempToken disponible para verificar MFA.');
    return; // O mostrar mensaje al usuario
  }
  // Este error dice que estás pasando un objeto donde espera un string
  // Asegúrate que `verifyMFA` reciba un objeto en el servicio también
  this.authService.verifyMFA({ tempToken: this.tempToken, totp }).subscribe({
    next: res => {
    
  this.redirectByIntCode(res?.intCode || 'default');



  },
    error: err => {
      console.error('Código MFA inválido:', err);
    }
  });

}

  private redirectByIntCode(intCode: string) {
     console.log('Código recibido:', intCode); 
  switch (intCode) {
    case 'P01':
      this.router.navigate(['/dashboard/paciente']);
      break;
    case 'D01':
      this.router.navigate(['/dashboard/doctor']);
      break;
    case 'E01':
      this.router.navigate(['/dashboard/enfermera']);
      break;
      case 'A01':
      this.router.navigate(['/dashboard/administrador']);
      break;
    default:
      alert('⚠️ Código de acceso no reconocido: ' + intCode);
this.router.navigate(['/auth/login']);
  }
}

onCloseMFAModal() {
  this.showMFAInput = false;
  this.showQRCode = false;
  this.tempToken = undefined;
  this.qrUrl = '';
  this.mfaConfigured = false;
  this.mfaForm.reset(); // Limpia el formulario
}

getQRCodeImage() {
  if (!this.qrUrl) return '';
  
  // Codifica correctamente la URL OTPAuth
  const encodedUrl = encodeURIComponent(this.qrUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodedUrl}`;
}

handleQRImageError() {
  console.error('Error al cargar la imagen QR');
  // Puedes implementar un fallback aquí si lo deseas
}

}