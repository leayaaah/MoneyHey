import React from 'react';

function Pagination(props) {
    return (
        <div>
            <nav>   
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${props.currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => props.onPageChange(props.currentPage - 1)}>
                            Previous
                        </button>
                    </li>
                    {[...Array(props.totalPages)].map((_, index) => (
                        <li key={index} className={`page-item ${props.currentPage === index + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => props.onPageChange(index + 1)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${props.currentPage === props.totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => props.onPageChange(props.currentPage + 1)}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Pagination;