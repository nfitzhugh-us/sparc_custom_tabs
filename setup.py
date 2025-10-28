import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="sparc_custom_tabs",
    version="0.1.0",
    author="Nick Fitzhugh",
    author_email="nicholas.j.fitzhugh@gmail.com",
    description="An all-in-one place, to find complex or just natively unavailable components on streamlit.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/nfitzhugh-us/sparc-custom-tabs",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    keywords=["Python", "Streamlit", "React", "JavaScript"],
    python_requires=">=3.6",
    install_requires=[
        "streamlit >= 1.40.1",
    ],
)