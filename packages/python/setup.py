from setuptools import setup, find_packages

setup(
    name="json-render",
    version="0.1.0",
    description="Python backend utilities for json-render",
    packages=find_packages(),
    install_requires=[
        # Add dependencies here if needed
    ],
    author="Vercel Labs",
    url="https://github.com/vercel-labs/json-render",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.7',
)
