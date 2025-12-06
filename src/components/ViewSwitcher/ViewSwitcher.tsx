import classNames from 'classnames';
import { useTimeline } from '../../hooks/useTimeline';
import styles from './ViewSwitcher.module.css';

export const ViewSwitcher = () => {
  const { viewMode, setViewMode } = useTimeline();

  return (
    <div className={styles.container}>
      <button
        className={classNames(styles.button, { [styles.active]: viewMode === 'vertical' })}
        onClick={() => setViewMode('vertical')}
      >
        List View
      </button>
      <button
        className={classNames(styles.button, { [styles.active]: viewMode === 'horizontal' })}
        onClick={() => setViewMode('horizontal')}
      >
        Track View
      </button>
    </div>
  );
};
