import './Skeleton.css';

const Skeleton = ({ width = '100%', height = '16px', radius = '8px', className = '', style = {} }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
};

export default Skeleton;
