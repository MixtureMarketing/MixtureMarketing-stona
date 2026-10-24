import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminChat from '../../components/portal/admin/AdminChat';
import AdminLeads from '../../components/portal/admin/AdminLeads';
import AdminClients from '../../components/portal/admin/AdminClients';

// jsdom nie liczy layoutu — pilnujemy klas, które na 390 px usuwają poziomy scroll
// (zweryfikowane w Playwright: scrollWidth 756 → 390 na wszystkich zakładkach).
describe('Panel admina na telefonie', () => {
  it('czat: jedna kolumna poniżej md, siatka 12 kolumn od md', () => {
    const { container } = render(
      <AdminChat
        conversations={[]}
        activeChatId={null}
        setActiveChatId={vi.fn()}
        chatMessages={[]}
        adminMessage=""
        setAdminMessage={vi.fn()}
        searchTerm=""
        setSearchTerm={vi.fn()}
        sendAdminMessage={vi.fn()}
        handleKeyDown={vi.fn()}
      />,
    );
    const grid = container.firstElementChild as HTMLElement;
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-12');
    expect(grid).not.toHaveClass('grid-cols-12');
  });

  it('tabele leadów i klientów przewijają się poziomo w swoim kontenerze', () => {
    const leads = render(
      <AdminLeads leads={[]} onViewDetails={vi.fn()} onConvert={vi.fn()} onReply={vi.fn()} />,
    );
    expect(leads.container.querySelector('table')?.parentElement).toHaveClass('overflow-x-auto');
    const clients = render(<AdminClients clients={[]} onEdit={vi.fn()} />);
    expect(clients.container.querySelector('table')?.parentElement).toHaveClass('overflow-x-auto');
  });
});
