import "./searchBarComponent.css";

export default function SearchBarComponent({ value, onChange }) {
  return (
    <div className="search-bar-component">
      <svg
        className="search-bar-icon"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.83333 7.83333L11.5 11.5M4.77778 9.05556C2.41523 9.05556 0.5 7.14033 0.5 4.77778C0.5 2.41523 2.41523 0.5 4.77778 0.5C7.14033 0.5 9.05556 2.41523 9.05556 4.77778C9.05556 7.14033 7.14033 9.05556 4.77778 9.05556Z"
        />
      </svg>
      <span className="search-bar-separator"></span>
      <input
        type="text"
        className="search-bar-input"
        placeholder="SEARCH..."
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
