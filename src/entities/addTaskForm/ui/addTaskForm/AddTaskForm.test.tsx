import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { ERROR_MESSAGE } from '../../consts';
import { AddTaskForm, AddTaskFormProps } from './AddTaskForm';

describe('AddTaskForm', () => {
  const defaultProps: AddTaskFormProps = {
    taskInputText: '',
    setTaskInputTextAction: jest.fn(),
    isValid: true,
    selectedCategory: 'ImportantUrgent' as MatrixKey,
    handleCategoryChange: jest.fn(),
    handleOnRadioKeyDown: jest.fn(),
    handleSubmit: jest.fn(),
    isNoTasks: false,
  };

  it('renders input and button', () => {
    render(<AddTaskForm {...defaultProps} />);
    expect(screen.getByTestId('add-task-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-task-button')).toBeInTheDocument();
  });

  it('calls setTaskInputTextAction on input change', () => {
    render(<AddTaskForm {...defaultProps} />);
    const input = screen.getByTestId('add-task-input');
    fireEvent.change(input, { target: { value: 'New Task' } });
    expect(defaultProps.setTaskInputTextAction).toHaveBeenCalledWith(
      'New Task',
    );
  });

  it('displays validation message when input is invalid', () => {
    render(<AddTaskForm {...defaultProps} isValid={false} />);
    expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
  });

  it('calls handleSubmit on form submit', () => {
    render(<AddTaskForm {...defaultProps} />);
    const form = screen.getByTestId('add-task-button').closest('form');
    fireEvent.submit(form!);
    expect(defaultProps.handleSubmit).toHaveBeenCalled();
  });

  it('calls handleCategoryChange on category change', () => {
    render(<AddTaskForm {...defaultProps} />);
    const radio = screen.getAllByRole('radio')[1];
    if (radio) {
      fireEvent.click(radio);
      expect(defaultProps.handleCategoryChange).toHaveBeenCalled();
    }
  });

  it('calls handleOnRadioKeyDown on category key down', () => {
    render(<AddTaskForm {...defaultProps} />);
    const span = screen.getAllByRole('radio')[0].nextSibling;
    if (span) {
      fireEvent.keyDown(span, { key: 'Enter' });
      expect(defaultProps.handleOnRadioKeyDown).toHaveBeenCalled();
    }
  });
});
