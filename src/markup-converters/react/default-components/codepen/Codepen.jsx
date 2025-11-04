const Codepen = ({ title, source }) => {
  return (
    <iframe
      height="300"
      style={{ width: '100%' }}
      scrolling="no"
      title={title}
      src={source}
      frameBorder="no"
      loading="lazy"
      // eslint-disable-next-line react/no-unknown-property
      allowTransparency="true"
    />
  );
};

export default Codepen;
