import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CagebreakExperience } from './Experience';
it('renders a controlled engine without sandbox or application UI', () => {
  const markup = renderToStaticMarkup(<CagebreakExperience progress={.3} />);
  expect(markup).toContain('cb-controlled');
  expect(markup).toContain('aria-busy="true"');
  expect(markup).not.toMatch(/DEVELOPMENT|SANDBOX|<header|<footer|<nav|Research transition ready/);
});
