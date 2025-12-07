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
      <button
        className={classNames(styles.button, { [styles.active]: viewMode === 'comic' })}
        onClick={() => setViewMode('comic')}
      >
        Comic View
      </button>
      <button
        className={classNames(styles.button, { [styles.active]: viewMode === 'mosaic' })}
        onClick={() => setViewMode('mosaic')}
      >
        Mosaic View
      </button>
    </div>
  );
};
