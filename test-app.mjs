import { chromium } from 'playwright';
import { join } from 'path';

const BASE = 'http://localhost:7341';
const SCDIR = 'C:\\Users\\Usuario\\AppData\\Local\\Temp\\claude\\C--Users-Usuario\\c9339716-6903-4ac1-870e-46368f65d32f\\scratchpad';

async function screenshot(page, name) {
  await page.screenshot({ path: join(SCDIR, `sc_${name}.png`), fullPage: false });
  console.log(`  [shot] ${name}`);
}

// El modal usa el atributo [hidden] para ocultarse (display:none via CSS).
// Playwright no puede "ver" un elemento hidden, así que usamos state: 'hidden' / 'visible'.
const modal = (page) => page.locator('#modalOverlay');
const waitModalOpen  = (page) => modal(page).waitFor({ state: 'visible' });
const waitModalClose = (page) => modal(page).waitFor({ state: 'hidden' });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('[JS-error]', m.text()); });

  // ─── 1. Carga inicial ─────────────────────────────────────────────
  console.log('\n=== 1. Carga inicial ===');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#taskList');
  await screenshot(page, '01_initial');
  console.log('  App cargada sin errores');

  // ─── 2. Crear tarea 1: alta prioridad, vence hoy ─────────────────
  console.log('\n=== 2. Crear tarea de alta prioridad (vence hoy) ===');
  await page.click('#newTaskBtn');
  await waitModalOpen(page);
  const today = new Date().toISOString().split('T')[0];
  await page.fill('#taskTitle', 'Revisar pull requests pendientes');
  await page.fill('#taskDescription', 'Hay 3 PRs críticos sin revisión en el repositorio principal.');
  await page.selectOption('#taskPriority', 'high');
  await page.fill('#taskDueDate', today);
  await screenshot(page, '02_form_filled');
  await page.click('button[type="submit"]');
  await waitModalClose(page);
  await screenshot(page, '03_task1_created');
  console.log('  Tarea 1 creada OK');

  // ─── 3. Crear tarea 2: media prioridad ───────────────────────────
  console.log('\n=== 3. Crear tarea de media prioridad ===');
  await page.click('#newTaskBtn');
  await waitModalOpen(page);
  await page.fill('#taskTitle', 'Actualizar documentación del API');
  await page.fill('#taskDescription', 'Agregar ejemplos de uso para los nuevos endpoints.');
  await page.selectOption('#taskPriority', 'medium');
  await page.click('button[type="submit"]');
  await waitModalClose(page);
  console.log('  Tarea 2 creada OK');

  // ─── 4. Crear tarea 3: baja prioridad ────────────────────────────
  console.log('\n=== 4. Crear tarea de baja prioridad ===');
  await page.click('#newTaskBtn');
  await waitModalOpen(page);
  await page.fill('#taskTitle', 'Refactorizar estilos del dashboard');
  await page.selectOption('#taskPriority', 'low');
  await page.click('button[type="submit"]');
  await waitModalClose(page);
  await screenshot(page, '04_three_tasks');
  const totalCreated = await page.locator('.task-card').count();
  console.log(`  3 tareas creadas. Visibles en pantalla: ${totalCreated}`);

  // ─── 5. Ciclar estado ────────────────────────────────────────────
  console.log('\n=== 5. Ciclar estado: Pendiente → En progreso ===');
  const statusBtn0 = page.locator('[data-action="cycle-status"]').first();
  const before = await statusBtn0.textContent();
  await statusBtn0.click();
  await page.waitForTimeout(300);
  const after = await page.locator('[data-action="cycle-status"]').first().textContent();
  console.log(`  "${before.trim()}" → "${after.trim()}"`);
  await screenshot(page, '05_status_changed');

  // ─── 6. Búsqueda ─────────────────────────────────────────────────
  console.log('\n=== 6. Búsqueda "API" con debounce ===');
  await page.fill('.search-box__input', 'API');
  await page.waitForTimeout(450);
  const filteredCount = await page.locator('.task-card').count();
  console.log(`  Visibles con "API": ${filteredCount} (esperado: 1)`);
  await screenshot(page, '06_search_api');
  await page.click('.search-box__clear');
  await page.waitForTimeout(450);
  const allCount = await page.locator('.task-card').count();
  console.log(`  Después de limpiar: ${allCount} (esperado: 3)`);

  // ─── 7. Filtro prioridad Alta ─────────────────────────────────────
  console.log('\n=== 7. Filtro prioridad: Alta ===');
  await page.click('.filter-btn[data-value="high"]');
  await page.waitForTimeout(200);
  const highCount = await page.locator('.task-card').count();
  console.log(`  Con prioridad alta: ${highCount} (esperado: 1)`);
  await screenshot(page, '07_filter_high');
  await page.click('.filter-btn[data-value="all"][data-filter="priority"]');
  await page.waitForTimeout(200);

  // ─── 8. Editar tarea ─────────────────────────────────────────────
  console.log('\n=== 8. Editar segunda tarea ===');
  const card2 = page.locator('.task-card').nth(1);
  await card2.hover();
  await card2.locator('[data-action="edit"]').click();
  await waitModalOpen(page);
  const loadedTitle = await page.inputValue('#taskTitle');
  console.log(`  Título cargado: "${loadedTitle}"`);
  await page.fill('#taskTitle', 'Actualizar documentación del API v2.0');
  await screenshot(page, '08_edit_form');
  await page.click('button[type="submit"]');
  await waitModalClose(page);
  await screenshot(page, '09_after_edit');
  console.log('  Editada OK');

  // ─── 9. Eliminar tarea ────────────────────────────────────────────
  console.log('\n=== 9. Eliminar tercera tarea ===');
  const card3 = page.locator('.task-card').nth(2);
  await card3.hover();
  await card3.locator('[data-action="delete"]').click();
  await waitModalOpen(page);
  await screenshot(page, '10_confirm_delete');
  await page.click('#confirmDelete');
  await waitModalClose(page);
  const remaining = await page.locator('.task-card').count();
  console.log(`  Restantes: ${remaining} (esperado: 2)`);
  await screenshot(page, '11_after_delete');

  // ─── 10. Validación: sin título ───────────────────────────────────
  console.log('\n=== 10. Validación: submit sin título ===');
  await page.click('#newTaskBtn');
  await waitModalOpen(page);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(200);
  const errVisible = await page.locator('#titleError').isVisible();
  console.log(`  Mensaje de error visible: ${errVisible} (esperado: true)`);
  await screenshot(page, '12_validation_error');
  await page.click('#modalClose');
  await waitModalClose(page);

  // ─── 11. Estadísticas ─────────────────────────────────────────────
  console.log('\n=== 11. Estadísticas ===');
  const statTotal = await page.locator('.stat--total .stat-card__value').textContent();
  const statDone  = await page.locator('.stat--completed .stat-card__value').textContent();
  console.log(`  Total: "${statTotal.trim()}" | Completadas: "${statDone.trim()}"`);

  // ─── 12. Persistencia: reload ─────────────────────────────────────
  console.log('\n=== 12. Persistencia localStorage (F5) ===');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#taskList');
  const afterReload = await page.locator('.task-card').count();
  console.log(`  Tareas tras reload: ${afterReload} (esperado: 2)`);
  await screenshot(page, '13_after_reload');

  // ─── 13. Responsive mobile ───────────────────────────────────────
  console.log('\n=== 13. Responsive mobile 375×812 ===');
  await page.setViewportSize({ width: 375, height: 812 });
  await screenshot(page, '14_mobile');
  await page.click('#menuToggle');
  await page.waitForTimeout(350);
  await screenshot(page, '15_mobile_sidebar');
  await page.click('#sidebarClose');
  await page.waitForTimeout(300);

  // ─── Reporte ─────────────────────────────────────────────────────
  const checks = [
    ['Búsqueda filtra correctamente',     filteredCount === 1],
    ['Limpiar búsqueda restaura tareas',  allCount === 3],
    ['Filtro prioridad alta',             highCount === 1],
    ['Eliminar reduce la lista',          remaining === 2],
    ['Persistencia tras reload',          afterReload === 2],
    ['Validación muestra error',          errVisible === true],
    ['Ciclo de estado funciona',          after.trim() === 'En progreso'],
  ];

  console.log('\n════════════════════════════════════════');
  console.log('REPORTE FINAL');
  console.log('════════════════════════════════════════');
  checks.forEach(([label, ok]) => console.log(`  ${ok ? '✅' : '❌'} ${label}`));
  if (pageErrors.length) console.error('\n  ❌ Errores JS:', pageErrors);
  else console.log('\n  ✅ Sin errores de JavaScript en ninguna pantalla');

  await browser.close();
}

run().catch(e => { console.error('\nFATAL:', e.message); process.exit(1); });
