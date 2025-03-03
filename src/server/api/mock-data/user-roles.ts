export const mockUserRoles = [
  ...Array(50).fill(null)
    .map((_) => {
      const status = ['Active', 'Draft', 'Archived'][Math.floor(Math.random() * 3)]
      const roleTypes = [
        'contact_viewer',
        'contact_editor',
        'contact_admin',
        'contact_manager',
        'contact_supervisor',
        'contact_coordinator',
        'contact_specialist',
        'contact_analyst',
        'contact_consultant',
        'contact_director'
      ]

      return {
        categories: ['User'],
        status,
        organization_id: '01JBHKXHYSKPP247HZZWHA3JCT',
        previous_status: status,
        role: `${roleTypes[Math.floor(Math.random() * roleTypes.length)]}_${Math.floor(Math.random() * 1000)}`,
        entity: 'Contact',
      }
    })
]