import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { Buttons } from './Buttons';

describe('Buttons component', () => {
  const handleToggleExpand = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders expand button when not expanded', () => {
    const { getByText } = render(
      <Buttons
        isExpandedCurrentQuadrant={false}
        quadrantKey={'ImportantUrgent' as MatrixKey}
        handleToggleExpand={handleToggleExpand}
      />,
    );

    expect(getByText('Expand')).toBeInTheDocument();
  });

  it('renders collapse button when expanded', () => {
    const { getByText } = render(
      <Buttons
        isExpandedCurrentQuadrant={true}
        quadrantKey={'ImportantUrgent' as MatrixKey}
        handleToggleExpand={handleToggleExpand}
      />,
    );

    expect(getByText('Collapse Quadrant')).toBeInTheDocument();
  });

  it('calls handleToggleExpand on button click', () => {
    const { getByText } = render(
      <Buttons
        isExpandedCurrentQuadrant={false}
        quadrantKey={'ImportantUrgent' as MatrixKey}
        handleToggleExpand={handleToggleExpand}
      />,
    );

    const button = getByText('Expand');
    fireEvent.click(button);

    expect(handleToggleExpand).toHaveBeenCalledTimes(1);
    expect(handleToggleExpand).toHaveBeenCalledWith(
      'ImportantUrgent' as MatrixKey,
    );
  });

  it('calls handleToggleExpand on collapse button click', () => {
    const { getByText } = render(
      <Buttons
        isExpandedCurrentQuadrant={true}
        quadrantKey={'ImportantUrgent' as MatrixKey}
        handleToggleExpand={handleToggleExpand}
      />,
    );

    const button = getByText('Collapse Quadrant');
    fireEvent.click(button);

    expect(handleToggleExpand).toHaveBeenCalledTimes(1);
    expect(handleToggleExpand).toHaveBeenCalledWith(
      'ImportantUrgent' as MatrixKey,
    );
  });
});
