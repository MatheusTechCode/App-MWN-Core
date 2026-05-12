import bcrypt from 'bcryptjs';
import { query, pool } from '../src/database/pool.js';

const [nome, email, senha, perfil] = process.argv.slice(2);

if (!nome || !email || !senha || !perfil) {
  console.error('Uso: node scripts/create-user.js "Nome" email senha perfil');
  process.exit(1);
}

const senhaHash = await bcrypt.hash(senha, 10);

await query(
  `insert into usuarios (nome, email, senha_hash, perfil)
   values ($1, $2, $3, $4)
   on conflict (email) do update
   set nome = excluded.nome, senha_hash = excluded.senha_hash, perfil = excluded.perfil, ativo = true`,
  [nome, email, senhaHash, perfil],
);

await pool.end();
console.log(`Usuário ${email} criado/atualizado com perfil ${perfil}.`);
