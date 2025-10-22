#!/usr/bin/env python3
"""
Sincronização Direta de Usuários: Prodify → OpenUIX
Este script sincroniza todos os usuários do Prodify para o OpenUIX
"""

import sqlite3
import psycopg2
from datetime import datetime

# Configurações
PRODIFY_DB = {
    'host': 'prodify-db-dev',
    'database': 'super_productive',
    'user': 'postgres',
    'password': 'password'
}

OPENUIX_DB = "/app/backend/data/webui.db"

def get_prodify_users():
    """Busca todos os usuários do Prodify"""
    try:
        conn = psycopg2.connect(**PRODIFY_DB)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, email, name, "hashedPassword"
            FROM "User"
            WHERE "hashedPassword" IS NOT NULL
        ''')
        
        users = cursor.fetchall()
        conn.close()
        
        print(f"✅ {len(users)} usuários encontrados no Prodify")
        return users
        
    except Exception as e:
        print(f"❌ Erro ao buscar usuários do Prodify: {e}")
        return []

def sync_user_to_openuix(user_id, email, name, hashed_password):
    """Sincroniza um usuário para o OpenUIX"""
    try:
        conn = sqlite3.connect(OPENUIX_DB)
        cursor = conn.cursor()
        
        # Verificar se já existe
        cursor.execute("SELECT id FROM auth WHERE email = ?", (email,))
        exists = cursor.fetchone()
        
        timestamp = int(datetime.now().timestamp())
        
        if exists:
            # Atualizar senha
            cursor.execute(
                "UPDATE auth SET password = ? WHERE email = ?",
                (hashed_password, email)
            )
            print(f"  ↻ Atualizado: {email}")
        else:
            # Criar novo
            cursor.execute("""
                INSERT INTO auth (id, email, password, active)
                VALUES (?, ?, ?, 1)
            """, (user_id, email, hashed_password))
            
            cursor.execute("""
                INSERT INTO user (
                    id, name, email, role, profile_image_url,
                    created_at, updated_at, last_active_at, settings, info
                )
                VALUES (?, ?, ?, 'user', '/static/favicon.png', ?, ?, ?, '{}', '{}')
            """, (user_id, name or email, email, timestamp, timestamp, timestamp))
            
            print(f"  + Criado: {email}")
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"  ❌ Erro ao sincronizar {email}: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("SINCRONIZAÇÃO PRODIFY → OPENUIX")
    print("="*60 + "\n")
    
    # Buscar usuários do Prodify
    users = get_prodify_users()
    
    if not users:
        print("❌ Nenhum usuário encontrado")
        return
    
    # Sincronizar cada usuário
    success_count = 0
    for user_id, email, name, hashed_password in users:
        if sync_user_to_openuix(user_id, email, name, hashed_password):
            success_count += 1
    
    print(f"\n✅ Sincronização completa: {success_count}/{len(users)} usuários")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()

