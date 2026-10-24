import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LeadDetailsModal from '../../components/portal/admin/LeadDetailsModal';
import { ReplyModal, MilestoneModal } from '../../components/portal/admin/AdminModals';
import { ProfileModal } from '../../components/portal/client/PortalModals';
import type { Lead } from '../../components/portal/types';

const lead = {
  id: 'L1',
  email: 'jan@sklep.pl',
  name: 'Jan',
  service_type: 'web',
  status: 'new',
  created_at: '2026-10-20 10:00:00',
  message: 'x',
  current_step: 1,
} as Lead;

describe('Modale portalu i panelu: role=dialog, fokus, Esc', () => {
  const cases: Array<[string, (onClose: () => void) => React.ReactElement]> = [
    ['LeadDetailsModal', (onClose) => <LeadDetailsModal lead={lead} onClose={onClose} />],
    [
      'ReplyModal',
      (onClose) => (
        <ReplyModal
          lead={lead}
          onClose={onClose}
          replyMessage=""
          setReplyMessage={vi.fn()}
          onReply={vi.fn()}
        />
      ),
    ],
    [
      'MilestoneModal',
      (onClose) => (
        <MilestoneModal
          milestone={null}
          onClose={onClose}
          onSave={vi.fn()}
          setMilestone={vi.fn()}
          isSaving={false}
        />
      ),
    ],
    [
      'ProfileModal',
      (onClose) => (
        <ProfileModal
          isOpen
          onClose={onClose}
          profileData={{ name: 'Anna', company_name: '' }}
          setProfileData={vi.fn()}
          onUpdate={vi.fn()}
          loading={false}
        />
      ),
    ],
  ];

  it.each(cases)('%s', (_name, make) => {
    const onClose = vi.fn();
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(make(onClose));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName();
    expect(document.activeElement).toBe(dialog);
    expect(screen.getByRole('button', { name: 'Zamknij' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.activeElement).toBe(opener); // fokus wraca do elementu, który otworzył
    opener.remove();
  });

  it('zamknięty ProfileModal nie łapie Esc', () => {
    const onClose = vi.fn();
    render(
      <ProfileModal
        isOpen={false}
        onClose={onClose}
        profileData={{ name: '', company_name: '' }}
        setProfileData={vi.fn()}
        onUpdate={vi.fn()}
        loading={false}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
