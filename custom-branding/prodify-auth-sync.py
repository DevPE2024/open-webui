#!/usr/bin/env python3
"""
Sistema de Sincronização de Autenticação entre Prodify e OpenUIX
Autor: Cursor AI Assistant
Data: 20 de Outubro de 2025

Este script sincroniza automaticamente usuários do Prodify para o OpenUIX.
Quando um usuário tenta fazer login, o sistema:
1. Verifica se existe no Prodify
2. Sincroniza para o OpenUIX (se necessário)
3. Autentica normalmente
"""

import sqlite3
import requests
import json
import bcrypt
from datetime import datetime

# Configurações
PRODIFY_API_URL = "http://prodify-app-dev:3000"
OPENUIX_DB_PATH = "/app/backend/data/webui.db"

def get_user_from_prodify(email):
    """Busca usuário no Prodify via API"""
    try:
        response = requests.get(
            f"{PRODIFY_API_URL}/api/auth/verify-user",
            params={"email": email},
            timeout=5
        )
        if response.ok:
            return response.json()
        return None
    except Exception as e:
        print(f"❌ Erro ao buscar usuário no Prodify: {e}")
        return None

def sync_user_to_openuix(user_data):
    """Sincroniza usuário do Prodify para o OpenUIX"""
    try:
        conn = sqlite3.connect(OPENUIX_DB_PATH)
        cursor = conn.cursor()
        
        # Verificar se usuário já existe
        cursor.execute("SELECT id FROM auth WHERE email = ?", (user_data['email'],))
        existing = cursor.fetchone()
        
        if existing:
            print(f"✅ Usuário {user_data['email']} já existe no OpenUIX")
            # Atualizar senha se necessário
            cursor.execute(
                "UPDATE auth SET password = ? WHERE email = ?",
                (user_data['hashedPassword'], user_data['email'])
            )
        else:
            print(f"📝 Criando usuário {user_data['email']} no OpenUIX...")
            
            # Timestamp
            timestamp = int(datetime.now().timestamp())
            
            # Inserir na tabela auth
            cursor.execute("""
                INSERT INTO auth (id, email, password, active)
                VALUES (?, ?, ?, 1)
            """, (user_data['id'], user_data['email'], user_data['hashedPassword']))
            
            # Inserir na tabela user
            cursor.execute("""
                INSERT INTO user (
                    id, name, email, role, profile_image_url, 
                    created_at, updated_at, last_active_at, settings, info
                )
                VALUES (?, ?, ?, 'user', '/static/favicon.png', ?, ?, ?, '{}', '{}')
            """, (
                user_data['id'],
                user_data['name'] or user_data['email'],
                user_data['email'],
                timestamp,
                timestamp,
                timestamp
            ))
            
            print(f"✅ Usuário {user_data['email']} sincronizado com sucesso!")
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao sincronizar usuário: {e}")
        return False

def verify_and_sync(email, password):
    """
    Verifica credenciais no Prodify e sincroniza para OpenUIX
    """
    print(f"\n🔍 Verificando usuário: {email}")
    
    # 1. Buscar usuário no Prodify
    user_data = get_user_from_prodify(email)
    
    if not user_data:
        print(f"❌ Usuário {email} não encontrado no Prodify")
        return False
    
    print(f"✅ Usuário encontrado no Prodify: {user_data.get('name', email)}")
    
    # 2. Verificar senha
    try:
        if bcrypt.checkpw(password.encode('utf-8'), user_data['hashedPassword'].encode('utf-8')):
            print("✅ Senha correta!")
            
            # 3. Sincronizar para OpenUIX
            if sync_user_to_openuix(user_data):
                print("✅ Sincronização completa!")
                return True
        else:
            print("❌ Senha incorreta")
            return False
    except Exception as e:
        print(f"❌ Erro ao verificar senha: {e}")
        return False
    
    return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Uso: python prodify-auth-sync.py <email> <senha>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    success = verify_and_sync(email, password)
    sys.exit(0 if success else 1)






