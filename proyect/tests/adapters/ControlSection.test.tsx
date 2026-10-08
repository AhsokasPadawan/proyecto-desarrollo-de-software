import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ControlSection } from '../../src/adapters/web/components/ControlSection';

describe('Web Adapter - ControlSection', () => {
  it('renders section title in uppercase tracking typography', () => {
    render(
      <ControlSection title="Opciones Avanzadas">
        <p>Contenido interior</p>
      </ControlSection>
    );

    const titleElement = screen.getByText('Opciones Avanzadas');
    expect(titleElement).toBeInTheDocument();
  });

  it('renders children nodes passed into the section', () => {
    render(
      <ControlSection title="Turno">
        <button data-testid="child-action">Pulsar</button>
      </ControlSection>
    );

    expect(screen.getByTestId('child-action')).toBeInTheDocument();
  });

  it('applies top divider border styles when hasDivider is set to true', () => {
    const { container } = render(
      <ControlSection title="Con Divisor" hasDivider={true}>
        <div>Contenido</div>
      </ControlSection>
    );

    const sectionElement = container.querySelector('section');
    expect(sectionElement).toHaveClass('border-t');
    expect(sectionElement).toHaveClass('border-zinc-800');
  });

  it('omits top divider border styles when hasDivider is false or omitted', () => {
    const { container } = render(
      <ControlSection title="Sin Divisor">
        <div>Contenido</div>
      </ControlSection>
    );

    const sectionElement = container.querySelector('section');
    expect(sectionElement).not.toHaveClass('border-t');
  });
});
