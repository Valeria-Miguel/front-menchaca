import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';

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
    RouterLink
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
        // MFA requerido pero aún no verificado
        if (data?.mfaRequired && data?.tempToken) {
          this.tempToken = data.tempToken;
          this.showMFAInput = true;
          return;
        }

        // MFA se acaba de configurar por primera vez
        if (data?.mfaConfigured && data?.qrUrl) {
          this.tempToken = data.tempToken;
          this.qrUrl = data.qrUrl;
          this.mfaConfigured = true;
          this.showQRCode = true;
          this.showMFAInput = true;
          return;
        }

        // Login exitoso normal (sin MFA)
        this.redirectByIntCode(res?.intCode || 'default');
        console.log('intCode recibido del backend:', res?.intCode);


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
    default:
      alert('⚠️ Código de acceso no reconocido: ' + intCode);
this.router.navigate(['/auth/login']);
  }
}

}