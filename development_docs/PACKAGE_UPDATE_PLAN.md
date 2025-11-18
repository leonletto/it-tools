# Package Update Plan - Vite 7 Migration

**Goal:** Systematically update packages to enable Vite 7 and restore Monaco Editor syntax highlighting

**Node.js Version:** ✅ Upgraded to v22.21.1 (meets Vite 7 requirement of 20.19+)

---

## Phase 1: Patch Updates (0.0.X - SAFEST) ✅

**Risk Level:** Very Low - Bug fixes only, no breaking changes

```bash
pnpm update \
  @tsconfig/node18@18.2.6 \
  @types/node-forge@1.3.14 \
  @types/qrcode@1.5.6 \
  @types/turndown@5.0.6 \
  js-base64@3.7.8 \
  less@4.4.2 \
  turndown@7.2.2 \
  xml-formatter@3.6.7 \
  yaml@2.8.1
```

**After Phase 1:**
- Run `pnpm run dev` and test the app
- Verify AutoCAD LLM Sync tool still works
- Commit: `git commit -m "chore: Update patch versions (0.0.X bumps)"`

---

## Phase 2: Minor Updates (0.X.0 - LOW RISK) ✅

**Risk Level:** Low - New features, backward compatible

### Phase 2A: Vue Ecosystem Updates

```bash
pnpm update \
  vue@3.5.24 \
  @vue/compiler-sfc@3.5.24 \
  @vue/runtime-dom@3.5.24 \
  vue-router@4.6.3 \
  naive-ui@2.43.2
```

### Phase 2B: Monaco Editor Update (IMPORTANT!)

```bash
pnpm update monaco-editor@0.54.0
```

**This is critical - Monaco Editor 0.54.0 may work better with Vite 7!**

### Phase 2C: Development Tools

```bash
pnpm update \
  @playwright/test@1.56.1 \
  @rushstack/eslint-patch@1.15.0 \
  eslint@9.39.1 \
  typescript@5.9.3 \
  unplugin-vue-markdown@29.2.0
```

### Phase 2D: UI & Utilities

```bash
pnpm update \
  @tabler/icons-vue@3.35.0 \
  @tiptap/pm@3.10.7 \
  @tiptap/starter-kit@3.10.7 \
  @tiptap/vue-3@3.10.7 \
  @unocss/eslint-config@66.5.6 \
  unocss@66.5.6 \
  cronstrue@3.9.0 \
  dompurify@3.3.0 \
  figlet@1.9.4 \
  libphonenumber-js@1.12.26 \
  oui-data@1.1.472
```

**After Phase 2:**
- Run `pnpm run dev` and test the app thoroughly
- Test AutoCAD LLM Sync tool with Monaco Editor
- Commit: `git commit -m "chore: Update minor versions (0.X.0 bumps)"`

---

## Phase 3: Major Updates - Vite & Critical Dependencies (HIGHER RISK) ⚠️

**Risk Level:** Medium-High - Breaking changes possible

### Phase 3A: Vite Core Upgrade (CRITICAL)

**IMPORTANT:** These must be updated together as a group!

```bash
pnpm update \
  vite@7.2.2 \
  @vitejs/plugin-vue@6.0.1 \
  @vitejs/plugin-vue-jsx@5.1.1 \
  vite-svg-loader@5.1.0 \
  vite-plugin-pwa@1.1.0
```

**After Phase 3A:**
- Run `pnpm run dev` - expect potential errors
- Check Vite migration guide: https://vite.dev/guide/migration
- Fix any breaking changes
- Test all tools, especially AutoCAD LLM Sync
- **Try re-enabling Monaco Editor workers with vite-plugin-monaco-editor!**
- Commit: `git commit -m "feat: Upgrade to Vite 7.2.2 and related plugins"`

### Phase 3B: Testing Framework (if Phase 3A succeeds)

```bash
pnpm update vitest@4.0.10
```

**After Phase 3B:**
- Run `pnpm run test:unit` to verify tests still pass
- Commit: `git commit -m "chore: Upgrade Vitest to 4.0.10"`

---

## Phase 4: Major Updates - Other Dependencies (ONE AT A TIME) ⚠️

**Risk Level:** Medium - Update one, test, commit, repeat

### High Priority (likely safe):

1. **@vueuse ecosystem** (update together):
   ```bash
   pnpm update @vueuse/core@14.0.0 @vueuse/head@2.0.0 @vueuse/router@14.0.0
   ```

2. **Pinia** (state management):
   ```bash
   pnpm update pinia@3.0.4
   ```

3. **Type definitions** (update together):
   ```bash
   pnpm update \
     @types/node@24.10.1 \
     @types/bcryptjs@3.0.0 \
     @types/jsdom@27.0.0 \
     @types/markdown-it@14.1.2 \
     @types/marked@6.0.0 \
     @types/mime-types@3.0.1 \
     @types/uuid@11.0.0
   ```

### Medium Priority (test carefully):

4. **vue-i18n** (internationalization):
   ```bash
   pnpm update vue-i18n@11.1.12
   ```

5. **vue-tsc** (TypeScript compiler):
   ```bash
   pnpm update vue-tsc@3.1.4
   ```

6. **Utility libraries** (one at a time):
   - `pnpm update date-fns@4.1.0`
   - `pnpm update uuid@13.0.0`
   - `pnpm update fuse.js@7.1.0`
   - `pnpm update marked@17.0.0`

**After each update in Phase 4:**
- Run `pnpm run dev` and test
- Commit individually: `git commit -m "chore: Update [package] to [version]"`

---

## Monaco Editor Re-enablement Plan (After Vite 7 Upgrade)

Once Vite 7 and Monaco Editor 0.54.0 are installed:

1. **Update vite.config.ts** to use `vite-plugin-monaco-editor`:
   ```typescript
   import monacoEditorPlugin from 'vite-plugin-monaco-editor'
   
   export default defineConfig({
     plugins: [
       vue(),
       monacoEditorPlugin({
         languageWorkers: ['json', 'editorWorkerService']
       })
     ]
   })
   ```

2. **Update autocad-llm-sync.vue**:
   - Remove `MonacoEnvironment.getWorker` configuration
   - Change JSON editor language from `'plaintext'` to `'json'`
   - Test syntax highlighting and validation

3. **If workers still fail**, try alternative plugin:
   ```bash
   pnpm remove vite-plugin-monaco-editor
   pnpm add -D @tomjs/vite-plugin-monaco-editor
   ```

---

## Rollback Plan

If any phase causes critical failures:

```bash
git reset --hard HEAD  # Discard uncommitted changes
git reset --soft HEAD~1  # Undo last commit (keep changes)
pnpm install  # Restore package-lock.yaml state
```

---

## Success Criteria

- ✅ All tools in it-tools work correctly
- ✅ AutoCAD LLM Sync tool fully functional
- ✅ Monaco Editor with JSON syntax highlighting (goal)
- ✅ All tests pass (`pnpm run test:unit`)
- ✅ Build succeeds (`pnpm run build`)
- ✅ No console errors in browser

