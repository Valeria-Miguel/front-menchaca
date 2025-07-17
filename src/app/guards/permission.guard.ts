import { Injectable } from '@angular/core';
import {CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);  
  
  const requiredPermissions = route.data['permissions'] as string[] || [];

  const hasAccess = authService.hasAnyPermission(requiredPermissions);

 if (!hasAccess) {
    messageService.add({ 
      severity: 'warn', 
      summary: 'Acceso denegado', 
      detail: 'No tienes permisos para acceder a esta sección', 
      life: 5000 
    });
    router.navigate(['/auth/login']);
    return false;
  }


  return true;
};

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isTokenExpired()) {
    authService.logout();
    router.navigate(['/auth/login']);
    return false;
  }
  
  return true;
};
