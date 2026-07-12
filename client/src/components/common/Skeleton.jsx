const Skeleton = ({
  variant = 'text', // 'text' | 'rect' | 'circle'
  className = '',
  width,
  height,
  ...props
}) => {
  const styles = {
    text: 'h-4 w-full rounded',
    rect: 'rounded-xl',
    circle: 'rounded-full'
  };

  const styleObj = {};
  if (width) styleObj.width = width;
  if (height) styleObj.height = height;

  return (
    <div
      className={`animate-pulse bg-surface-alt ${styles[variant]} ${className}`}
      style={styleObj}
      {...props}
    />
  );
};

export default Skeleton;
