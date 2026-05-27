import { config, singleton, fields } from '@keystatic/core'

// Content schema shared by all locales
const localeContentSchema = {
  meta: fields.object(
    {
      site_title: fields.text({ label: 'Site Title (browser tab)' }),
      description: fields.text({ label: 'Meta Description', multiline: true }),
      theme_label: fields.text({
        label: 'Theme Label',
        description: 'Human-readable, e.g. Modern · Editorial',
      }),
    },
    { label: 'SEO / Meta' }
  ),

  nav: fields.object(
    {
      cta_label: fields.text({ label: 'CTA Button Label' }),
      cta_href: fields.text({ label: 'CTA Button Link', defaultValue: 'contact' }),
    },
    { label: 'Navigation' }
  ),

  hero: fields.object(
    {
      eyebrow: fields.text({ label: 'Eyebrow Text' }),
      headline: fields.text({ label: 'Headline' }),
      subheadline: fields.text({ label: 'Subheadline', multiline: true }),
      cta_primary_label: fields.text({ label: 'Primary CTA Label' }),
      cta_secondary_label: fields.text({ label: 'Secondary CTA Label' }),
    },
    { label: 'Hero Section' }
  ),

  stats: fields.array(
    fields.object({
      number: fields.text({ label: 'Number / Stat (e.g. 12+)' }),
      label: fields.text({ label: 'Label (e.g. Years of Experience)' }),
    }),
    {
      label: 'Stats Bar',
      itemLabel: props => `${props.fields.number.value} ${props.fields.label.value}`,
    }
  ),

  services: fields.object(
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      headline: fields.text({ label: 'Headline' }),
      subheadline: fields.text({ label: 'Homepage Subheadline' }),
      page_subheadline: fields.text({ label: 'Services Page Subheadline' }),
      items: fields.array(
        fields.object({
          icon: fields.text({ label: 'Icon (emoji)' }),
          title: fields.text({ label: 'Service Title' }),
          body: fields.text({ label: 'Description', multiline: true }),
          features: fields.array(
            fields.text({ label: 'Feature' }),
            { label: 'Features', itemLabel: props => props.value }
          ),
        }),
        { label: 'Service Items', itemLabel: props => props.fields.title.value }
      ),
    },
    { label: 'Services' }
  ),

  process: fields.object(
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      headline: fields.text({ label: 'Headline' }),
      steps: fields.array(
        fields.object({
          title: fields.text({ label: 'Step Title' }),
          body: fields.text({ label: 'Step Description', multiline: true }),
        }),
        { label: 'Steps', itemLabel: props => props.fields.title.value }
      ),
    },
    { label: 'Process / How We Work' }
  ),

  about: fields.object(
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      headline: fields.text({ label: 'Headline' }),
      page_subheadline: fields.text({ label: 'Page Subheadline' }),
      body: fields.text({ label: 'Intro Body', multiline: true }),
      mission_headline: fields.text({ label: 'Mission Headline' }),
      mission_body_1: fields.text({ label: 'Mission Paragraph 1', multiline: true }),
      mission_body_2: fields.text({ label: 'Mission Paragraph 2', multiline: true }),
      mission_emoji: fields.text({ label: 'Mission Emoji' }),
      values_headline: fields.text({ label: 'Values Section Headline' }),
      team_headline: fields.text({ label: 'Team Section Headline' }),
      team_subheadline: fields.text({ label: 'Team Subheadline' }),
      values: fields.array(
        fields.object({
          icon: fields.text({ label: 'Icon (emoji)' }),
          title: fields.text({ label: 'Value Title' }),
          body: fields.text({ label: 'Description', multiline: true }),
        }),
        { label: 'Values', itemLabel: props => props.fields.title.value }
      ),
      team: fields.array(
        fields.object({
          name: fields.text({ label: 'Name' }),
          role: fields.text({ label: 'Role / Title' }),
          emoji: fields.text({ label: 'Emoji' }),
        }),
        { label: 'Team Members', itemLabel: props => props.fields.name.value }
      ),
    },
    { label: 'About' }
  ),

  testimonials: fields.array(
    fields.object({
      text: fields.text({ label: 'Quote', multiline: true }),
      author: fields.text({ label: 'Author Name' }),
      role: fields.text({ label: 'Author Role / Company' }),
      emoji: fields.text({ label: 'Emoji' }),
    }),
    { label: 'Testimonials', itemLabel: props => props.fields.author.value }
  ),

  cta: fields.object(
    {
      eyebrow: fields.text({ label: 'Eyebrow' }),
      headline: fields.text({ label: 'Headline' }),
      subheadline: fields.text({ label: 'Subheadline' }),
    },
    { label: 'CTA Section' }
  ),

  contact: fields.object(
    {
      page_subheadline: fields.text({ label: 'Page Subheadline' }),
      intro: fields.text({ label: 'Intro Text', multiline: true }),
      email: fields.text({ label: 'Email Address' }),
      phone: fields.text({ label: 'Phone Number' }),
      address: fields.text({ label: 'Office Address' }),
      hours: fields.text({ label: 'Business Hours' }),
      form_service_options: fields.array(
        fields.text({ label: 'Option' }),
        { label: 'Form Service Dropdown Options', itemLabel: props => props.value }
      ),
    },
    { label: 'Contact' }
  ),

  footer: fields.object(
    {
      tagline: fields.text({ label: 'Footer Tagline' }),
      copyright: fields.text({ label: 'Copyright Text (company name)' }),
    },
    { label: 'Footer' }
  ),
}

// Full client schema: structural fields + locale-nested content
const clientSchema = {
  theme: fields.select({
    label: 'Theme (Layout)',
    options: [
      { label: 'Modern', value: 'modern' },
      { label: 'Sober', value: 'sober' },
      { label: 'Simplistic', value: 'simplistic' },
    ],
    defaultValue: 'modern',
  }),

  style: fields.select({
    label: 'Style',
    options: [
      { label: 'Editorial (Modern)', value: 'style-1-editorial' },
      { label: 'Terminal (Modern)', value: 'style-2-terminal' },
      { label: 'Garden (Modern)', value: 'style-3-garden' },
      { label: 'Studio (Modern)', value: 'style-4-studio' },
      { label: 'Bold (Modern)', value: 'style-5-bold' },
      { label: 'Industrial (Sober)', value: 'style-6-industrial' },
      { label: 'Industrial Blue (Sober)', value: 'style-7-industrial-blue' },
      { label: 'Corporate Red (Sober)', value: 'style-8-corporate-red' },
      { label: 'Simplistic (Simplistic)', value: 'style-9-simplistic' },
    ],
    defaultValue: 'style-1-editorial',
  }),

  demo_mode: fields.checkbox({
    label: 'Demo Mode',
    description: 'Show the theme/style switcher. Turn off before going live.',
    defaultValue: true,
  }),

  brand: fields.object(
    {
      name: fields.text({ label: 'Company Name' }),
      logo_text: fields.text({ label: 'Logo Text (main part)' }),
      logo_accent: fields.text({ label: 'Logo Accent (highlighted part)' }),
      logo_image: fields.text({
        label: 'Logo Image Path',
        description: 'Relative to the client folder, e.g. ../assets/logo.png or ../assets/logo.svg',
      }),
      tagline: fields.text({ label: 'Tagline' }),
    },
    { label: 'Brand' }
  ),

  social: fields.object(
    {
      linkedin: fields.text({ label: 'LinkedIn URL' }),
      twitter: fields.text({ label: 'Twitter / X URL' }),
    },
    { label: 'Social Links' }
  ),

  es: fields.object(localeContentSchema, { label: 'Spanish Content (es)' }),
  en: fields.object(localeContentSchema, { label: 'English Content (en)' }),
  zh: fields.object(localeContentSchema, { label: 'Chinese Content (zh)' }),
}

export default config({
  storage: { kind: 'local' },

  // One singleton per client — each reads/writes its client.config.json directly.
  // To add a new client: copy a block, update the key, label, and path, then restart npm run dev.
  singletons: {
    'client-1': singleton({
      label: 'ShaJa Digital (client-1)',
      path: 'clients/client-1/client.config',
      format: { data: 'json' },
      entryLayout: 'form',
      schema: clientSchema,
    }),

    'client-2': singleton({
      label: 'Verdant Studio (client-2)',
      path: 'clients/client-2/client.config',
      format: { data: 'json' },
      entryLayout: 'form',
      schema: clientSchema,
    }),

    'vierszka': singleton({
      label: 'Vierszka Adventures (vierszka)',
      path: 'clients/vierszka/client.config',
      format: { data: 'json' },
      entryLayout: 'form',
      schema: clientSchema,
    }),
  },
})
