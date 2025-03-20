// Simplified mock search function that doesn't use field parameter
export const mockFilterValueSearch = async (
  searchTerm: string,
): Promise<Array<{ value: string; label: string }>> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple mock data array
  const mockData = [
    { value: 'john', label: 'John Doe' },
    { value: 'jane', label: 'Jane Smith' },
    { value: 'bob', label: 'Bob Johnson' },
    { value: 'alice', label: 'Alice Williams' },
    { value: 'charlie', label: 'Charlie Brown' },
    { value: 'david', label: 'David Miller' },
    { value: 'emma', label: 'Emma Wilson' },
    { value: 'frank', label: 'Frank Thomas' },
    { value: 'grace', label: 'Grace Lee' },
    { value: 'henry', label: 'Henry Garcia' },
  ];

  // Filter based on search term
  return mockData.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase()),
  );
};