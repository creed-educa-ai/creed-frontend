import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WelcomeView } from '@/features/welcome/WelcomeView';

describe('WelcomeView', () => {
  it('renderiza o título de boas-vindas', () => {
    render(<WelcomeView />);
    expect(screen.getByText('Bem vindo!')).toBeInTheDocument();
  });
});
