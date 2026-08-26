# Adding New Domain Cards - Quick Reference

## 🎨 Colors & Icons Auto-Selection

When adding new domain cards to the Supabase database, use the color palette and icon helpers for consistency.

### Available Colors (12 total)

```javascript
// Already used (8 domains):
"#1e6bff"; // Blue - SWE
"#00c4ff"; // Cyan - IT Ops
"#f5a623"; // Gold - Modernization
"#10b981"; // Green - Business Intelligence
"#8b5cf6"; // Purple - AI Marketplace
"#06b6d4"; // Teal - Enterprise Intelligence
"#ef4444"; // Red - AI Governance
"#f59e0b"; // Amber - AI Catalog

// Available for new domains (4 extra):
"#ec4899"; // Pink
"#14b8a6"; // Emerald
"#6366f1"; // Indigo
"#f97316"; // Orange
```

### Available Icons (12 domain icons + extras)

```javascript
// Already used (8 domains):
"code"; // SWE
"monitor"; // IT Ops
"layers"; // Modernization
"chart"; // Business Intelligence
"cart"; // AI Marketplace
"cube"; // Enterprise Intelligence
"shield"; // AI Governance
"grid"; // AI Catalog

// Available for new domains (4 extra):
"database"; // For data/storage domains
"settings"; // For configuration/admin domains
"bell"; // For notifications/alerts domains
"zap"; // For performance/automation domains

// Other available icons:
("sun", "play", "folder", "users", "calendar", "search", "message");
```

---

## 📝 SQL Example: Adding a New Domain

```sql
-- Example: Adding a 9th domain
INSERT INTO domains (
  slug,
  name,
  description,
  route,
  icon_name,
  accent_color,
  badge_text,
  metrics,
  display_order,
  is_visible,
  status
) VALUES (
  'cloud',
  'Cloud Infrastructure',
  'AI-powered cloud infrastructure management and optimization platform',
  '/domain/cloud',
  'database',           -- Use next available icon
  '#ec4899',            -- Use next available color (pink)
  '9 Agents',
  '{"agents": 9, "models": 5, "accuracy": 89}',
  9,                    -- Next order number
  true,
  'active'
);
```

---

## 🔄 Alternative Color Assignment

### Method 1: Sequential (Alternating)

Use colors in order: 1st extra domain gets pink, 2nd gets emerald, 3rd gets indigo, 4th gets orange, then cycle repeats.

### Method 2: Random (for variety)

Pick randomly from the 4 extra colors for each new domain.

### Method 3: Automatic (using helpers)

```javascript
import { getNextColor, getNextIcon } from "../constants/domain-colors";

// For 9th domain (index 8):
const color = getNextColor(8); // Returns '#ec4899' (pink)
const icon = getNextIcon(8); // Returns 'database'
```

---

## ✅ Quick Checklist When Adding Domains

1. **Choose next display_order** (current max + 1)
2. **Pick icon** from available icons list
3. **Pick color** from extra colors or use helper function
4. **Create route** following pattern `/domain/{slug}`
5. **Set is_visible** to `true` to show immediately
6. **Set status** to `'active'`
7. **Add metrics** as jsonb object (optional)

---

## 🎯 Design Consistency Rules

✅ **DO:**

- Use provided color palette
- Use icon names from Icon.jsx
- Follow naming conventions (lowercase slugs)
- Increment display_order sequentially
- Keep descriptions concise (1-2 sentences)

❌ **DON'T:**

- Use custom colors outside the palette
- Use icon names not defined in Icon.jsx
- Skip display_order numbers
- Store SVG code in database
- Use extremely long descriptions

---

## 💡 Pro Tips

1. **Color Psychology**: Choose colors that match domain purpose (e.g., green for eco/sustainability, red for security/alerts)

2. **Icon Selection**: Pick icons that visually represent the domain's function

3. **Badge Text**: Keep concise (e.g., "X Agents", "X Solutions", "X Models")

4. **Metrics**: Store flexible JSON data for custom metrics display

5. **Future-Proof**: Extra colors and icons are commented in code for easy reference

---

## 🔍 Finding Available Colors/Icons

**In Code:**

- See `src/constants/domain-colors.js` for full color palette
- See `src/components/Icon.jsx` for all available icons

**Current Usage:**

```sql
-- Check which colors are in use
SELECT accent_color, COUNT(*)
FROM domains
GROUP BY accent_color;

-- Check which icons are in use
SELECT icon_name, COUNT(*)
FROM domains
GROUP BY icon_name;
```

---

**Last Updated:** Dashboard migration complete with 8 domains
**Next Domain Number:** 9
**Available Colors:** 4 extra (pink, emerald, indigo, orange)
**Available Icons:** 4 extra (database, settings, bell, zap) + others
