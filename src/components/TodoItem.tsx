import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import * as action from '../api/todos';
import { Todo } from '../types/Todo';

interface Props {
  title: string;
  id: number;
  status?: boolean;
  userId: number;
  onError: (error: Error) => void;
  idsToDelete: number[] | null;
  resetIdsToDelete: (todoIds: number[]) => void;
  handleDelete: (id: number) => void;
  handleUpdate: (todo: Todo) => Promise<void>;
}

export const TodoItem: React.FC<Props> = ({
  status = false,
  title,
  id,
  userId,
  onError,
  idsToDelete,
  resetIdsToDelete,
  handleDelete,
  handleUpdate,
}) => {
  const [value, setValue] = useState(title);
  const [deletedTodoId, setDeletedTodoId] = useState(0);
  const [isToggling, setIsToggling] = useState(false);


  const deleteTodo: React.MouseEventHandler<HTMLButtonElement> = () => {
    setDeletedTodoId(id);

    action
      .deleteTodo(id)
      .then(() => {
        handleDelete(id);
      })
      .catch(onError)
      .finally(() => setDeletedTodoId(0));
  };

  useEffect(() => {
    if (idsToDelete?.includes(id)) {
      action
        .deleteTodo(id)
        .then(() => {
          handleDelete(id);
          resetIdsToDelete(idsToDelete?.filter(todoId => todoId !== id));
        })
        .catch(onError);
    }
  }, [idsToDelete]);

  const toggleHandler = () => {
    setIsToggling(!isToggling);
    handleUpdate({ id, title, userId, completed: !status }).finally(() =>
      setIsToggling(isToggling),
    );
  };

  return (
    <div data-cy="Todo" className={classNames('todo', { completed: status })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          value={value}
          checked={status}
          onChange={event => setValue(event.target.value)}
          onClick={toggleHandler}
          aria-label="Todo input field"
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {value}
      </span>

      {/* Remove button appears only on hover */}
      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={deleteTodo}
      >
        ×
      </button>

      {/* overlay will cover the todo while it is being deleted or updated */}
      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active':
            deletedTodoId === id || idsToDelete?.includes(id) || isToggling,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
